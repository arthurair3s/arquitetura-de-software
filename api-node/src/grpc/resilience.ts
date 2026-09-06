import grpc from '@grpc/grpc-js';

/**
 * Política de resiliência aplicada a todas as chamadas gRPC de saída.
 *
 * Sem deadline, uma chamada a um microserviço indisponível fica pendurada até o
 * TCP desistir (minutos), segurando o resolver GraphQL e o event loop junto.
 * O deadline é o orçamento total da chamada — ele engloba as retentativas.
 */
export const DEADLINE_PADRAO_MS = 5000;

/**
 * Deadline maior para operações que dependem do motor de roteamento (OSRM),
 * que pode levar alguns segundos em trajetos longos.
 */
export const DEADLINE_ROTEAMENTO_MS = 8000;

/**
 * Retentativa automática apenas para falhas transitórias de transporte
 * (UNAVAILABLE = serviço reiniciando / ainda subindo no compose).
 * Não retentamos erros de aplicação — eles não melhoram com repetição.
 */
const SERVICE_CONFIG = {
  methodConfig: [
    {
      name: [{}], // todos os métodos de todos os serviços
      retryPolicy: {
        maxAttempts: 3,
        initialBackoff: '0.2s',
        maxBackoff: '1s',
        backoffMultiplier: 2,
        retryableStatusCodes: ['UNAVAILABLE'],
      },
    },
  ],
};

export function opcoesDeCanal(): grpc.ChannelOptions {
  return {
    'grpc.enable_retries': 1,
    'grpc.service_config': JSON.stringify(SERVICE_CONFIG),
  };
}

/**
 * Devolve um proxy do client que injeta um deadline em toda chamada unária.
 *
 * A detecção é feita pelos metadados que o grpc-js anexa a cada método gerado
 * (`path`, `requestStream`, `responseStream`), então métodos de streaming
 * long-lived — como AtualizarLocalizacaoStream — e métodos da classe base
 * (`close`, `waitForReady`) são preservados intactos automaticamente.
 */
export function comDeadline<T extends grpc.Client>(client: T, timeoutMs: number = DEADLINE_PADRAO_MS): T {
  return new Proxy(client, {
    get(alvo, prop) {
      const original = Reflect.get(alvo, prop);

      if (typeof original !== 'function') return original;

      const ehUnario =
        typeof (original as any).path === 'string' &&
        (original as any).requestStream === false &&
        (original as any).responseStream === false;

      if (!ehUnario) return vincular(original, alvo);

      return vincular((...args: any[]) => {
        const ultimo = args[args.length - 1];

        // assinatura esperada: (request, callback) → (request, options, callback)
        if (typeof ultimo === 'function') {
          const opcoes: grpc.CallOptions = { deadline: new Date(Date.now() + timeoutMs) };
          return original.apply(alvo, [...args.slice(0, -1), opcoes, ultimo]);
        }

        return original.apply(alvo, args);
      }, alvo, original);
    },
  });
}

/**
 * Liga a função ao client real preservando os metadados que o grpc-js anexa
 * ao método (path, requestStream, responseStream, serializers). Sem isso, um
 * `.bind()` cru devolveria uma função anônima e qualquer código que inspecione
 * esses campos passaria a ver `undefined`.
 */
function vincular(fn: Function, alvo: unknown, origem: Function = fn): Function {
  const vinculada = fn.bind(alvo);
  Object.assign(vinculada, origem);
  return vinculada;
}
