import type { Redis } from 'ioredis';
import { redis as clienteRedisPadrao } from './redisClient.js';
import { logger } from '../../utils/logger.js';

/**
 * Implementação genérica de cache-aside sobre o Redis.
 *
 * Fica na camada de infraestrutura justamente para que os adaptadores possam
 * decorar um repositório sem que a aplicação — ou pior, o resolver GraphQL —
 * precise saber que existe cache.
 *
 * Degradação graciosa: qualquer falha do Redis é registrada e a leitura segue
 * para a origem. Um cache indisponível deixa o sistema lento, nunca quebrado.
 */
export class CacheAside {
  constructor(
    private readonly contexto: string,
    private readonly redis: Redis = clienteRedisPadrao
  ) {}

  /**
   * Devolve o valor do cache quando presente; caso contrário carrega da origem
   * e grava o resultado serializado com o TTL informado.
   *
   * `serializar`/`reidratar` existem porque as entidades de domínio têm campos
   * privados e Value Objects: um JSON.parse cru devolveria um objeto solto com
   * `_nome`, sem invariantes e sem comportamento.
   */
  async lerOuCarregar<TDominio, TBruto>(
    chave: string,
    ttlSegundos: number,
    carregar: () => Promise<TDominio>,
    serializar: (valor: TDominio) => TBruto,
    reidratar: (bruto: TBruto) => TDominio
  ): Promise<TDominio> {
    try {
      const emCache = await this.redis.get(chave);
      if (emCache !== null) {
        return reidratar(JSON.parse(emCache) as TBruto);
      }
    } catch (err) {
      logger.warn(`Falha ao ler a chave '${chave}': ${err}. Seguindo para a origem.`, this.contexto);
    }

    const valor = await carregar();

    // não cacheamos ausência: um null gravado transformaria "ainda não existe"
    // em "não existe pelos próximos N segundos".
    if (valor === null || valor === undefined) return valor;

    try {
      await this.redis.set(chave, JSON.stringify(serializar(valor)), 'EX', ttlSegundos);
    } catch (err) {
      logger.warn(`Falha ao gravar a chave '${chave}': ${err}.`, this.contexto);
    }

    return valor;
  }

  /** Invalida chaves após uma escrita. Nunca propaga erro para a mutation. */
  async invalidar(...chaves: string[]): Promise<void> {
    if (chaves.length === 0) return;
    try {
      await this.redis.del(...chaves);
    } catch (err) {
      logger.warn(`Falha ao invalidar [${chaves.join(', ')}]: ${err}.`, this.contexto);
    }
  }
}
