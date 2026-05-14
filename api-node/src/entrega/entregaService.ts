import * as entregaRepository from './entregaRepository.js'
import * as pedidoRepository from '../pedido/pedidoRepository.js'
import * as restauranteRepository from '../restaurante/restauranteRepository.js'
import { EntregadorAppService } from '../entregador/application/entregadorService.js'
import { EntregadorRepository } from '../entregador/infrastructure/entregadorRepository.js'
import { RestauranteAppService } from '../restaurante/application/restauranteService.js'
import { RestauranteRepository } from '../restaurante/infrastructure/restauranteRepository.js'
const entregadorService = new EntregadorAppService(
  new EntregadorRepository(),
  new RestauranteAppService(new RestauranteRepository()),
  new GrpcRoteamentoProvider()
)
import { RoteamentoAppService } from '../roteamento/application/roteamentoService.js'
import { GrpcRoteamentoProvider } from '../roteamento/infrastructure/grpcRoteamentoProvider.js'
const roteamentoService = new RoteamentoAppService(new GrpcRoteamentoProvider())
import { Entrega, EntregaInvalidaError } from './domain/Entrega.js'
import { logger } from '../shared/utils/logger.js'

const activeSimulations = new Map<number, NodeJS.Timeout>();
const routeCache = new Map<string, any>(); // cache de trajetos

export const listar = async (): Promise<Entrega[]> => {
  return entregaRepository.listarEntregas()
}

export const buscarPorId = async (id: number | string): Promise<Entrega | null> => {
  return entregaRepository.buscarEntregaPorId(id)
}

export const criar = async (dados: {
  pedido_id: number | string;
  entregador_id: number | string;
  status?: string;
  previsao_entrega?: string | Date;
}): Promise<Entrega> => {
  const entrega = new Entrega(
    Number(dados.pedido_id),
    Number(dados.entregador_id),
    dados.status,
    dados.previsao_entrega ? new Date(dados.previsao_entrega) : null
  );
  return entregaRepository.criarEntrega(entrega)
}

export const editarPorId = async (id: number | string, dados: {
  pedido_id?: number | string;
  entregador_id?: number | string;
  status?: string;
  previsao_entrega?: string | Date;
}): Promise<Entrega> => {
  const entregaAtual = await entregaRepository.buscarEntregaPorId(id);
  if (!entregaAtual) {
    throw new EntregaInvalidaError('Entrega não encontrada');
  }

  if (dados.status !== undefined) entregaAtual.status = dados.status;
  if (dados.previsao_entrega !== undefined) entregaAtual.previsao_entrega = dados.previsao_entrega ? new Date(dados.previsao_entrega) : null;
  // atualização de dados via setters ou repositório

  return entregaRepository.editarEntregaPorId(id, entregaAtual)
}

export const deletar = async (id: number | string): Promise<boolean> => {
  return entregaRepository.deletarEntrega(id)
}

export const buscarPorPedidoId = async (id: number | string): Promise<Entrega[]> => {
  return entregaRepository.buscarEntregaPorPedidoId(id)
}

export const buscarPorEntregadorId = async (id: number | string): Promise<Entrega[]> => {
  return entregaRepository.buscarEntregaPorEntregadorId(id)
}

export const atribuirMelhorEntregador = async (pedidoId: number | string): Promise<Entrega> => {
  const pedido = await pedidoRepository.buscarPedidoPorId(pedidoId)
  if (!pedido) throw new EntregaInvalidaError('Pedido não encontrado.')

  const restaurante = await restauranteRepository.buscarRestaurantePorId(pedido.restaurante_id)
  if (!restaurante || restaurante.latitude == null || restaurante.longitude == null) {
    throw new EntregaInvalidaError('Restaurante sem coordenadas geográficas cadastradas.')
  }

  let candidatos = await entregadorService.listarProximosAoRestaurante(restaurante.id!, 2.0)
  
  if (!candidatos || candidatos.length === 0) {
    logger.info(`Ninguém a 2.0km. Tentando busca elástica de 3.5km...`, 'EntregaService');
    candidatos = await entregadorService.listarProximosAoRestaurante(restaurante.id!, 3.5);
  }

  let melhor = null
  let etaFinal = 0

  if (!candidatos || candidatos.length === 0) {
    logger.warn(`Radar vazio para o restaurante ${restaurante.nome} (ID: ${restaurante.id}). Falha ao encontrar motoboys.`, 'EntregaService');
    throw new EntregaInvalidaError('Nenhum entregador disponível num raio de 3.5km.');
  }

  const disponiveis = candidatos.filter(e => e.status === 'DISPONIVEL' || e.status === '1' || (e.status as any) === 1)

  if (disponiveis.length === 0) {
    logger.warn('Candidatos no radar estão ocupados. Falhando atribuição.', 'EntregaService');
    throw new EntregaInvalidaError('Todos os entregadores na região estão ocupados no momento.');
  }

  const selecionados = disponiveis.slice(0, 5) 

  const candidatosComEta = await Promise.all(
    selecionados.map(async entregador => {
      try {
        const resumo = await roteamentoService.calcularResumo(
          Number(entregador.latitude),
          Number(entregador.longitude),
          Number(restaurante.latitude),
          Number(restaurante.longitude)
        )
        return { entregador, eta: resumo.duracao_estimada_segundos }
      } catch (error) {
        return { entregador, eta: Infinity }
      }
    })
  )

  candidatosComEta.sort((a, b) => a.eta - b.eta)
  melhor = candidatosComEta[0].entregador
  etaFinal = candidatosComEta[0].eta

  logger.info(`Sucesso: Entregador ${melhor.nome} vinculado ao pedido ${pedidoId}.`, 'EntregaService');

  const entrega = await criar({
    pedido_id: pedidoId,
    entregador_id: melhor.id!,
    status: 'ATRIBUIDA'
  })

  if (melhor.status === 'DISPONIVEL' || melhor.status === '1' || (melhor.status as any) === 1) {
    try {
      await entregadorService.atualizarStatus(melhor.id!, 'EM_ENTREGA')
      logger.info(`Status de ${melhor.nome} alterado para EM_ENTREGA`, 'GRPC');
    } catch (err: any) {
      logger.error(`Falha ao atualizar status do entregador: ${err.message}`, 'GRPC');
    }
  }

  return entrega
}

export const simularDeslocamento = async (entregaId: number | string): Promise<boolean> => {
  const entregaIdNum = Number(entregaId);
  if (activeSimulations.has(entregaIdNum)) return true;

  const entrega = await buscarPorId(entregaId);
  if (!entrega) throw new EntregaInvalidaError('entrega nao encontrada');

  const pedido = await pedidoRepository.buscarPedidoPorId(entrega.pedido_id);
  const motorista = await entregadorService.buscarPorId(entrega.entregador_id);
  
  if (!pedido || !motorista) throw new EntregaInvalidaError('pedido ou motorista nao encontrado');

  const currentStatus = (entrega.status || "").trim().toUpperCase();
  logger.info(`Início para entrega ${entregaId}. Status: ${currentStatus}`, 'Simulação');

  entregadorService.bloquearParaSimulacao(entrega.entregador_id);
  await entregadorService.atualizarStatus(entrega.entregador_id, 'EM_ENTREGA');

  let destLat = Number(pedido.destino_latitude);
  let destLon = Number(pedido.destino_longitude);

  if (currentStatus === 'ATRIBUIDA') {
    const restaurante = await restauranteRepository.buscarRestaurantePorId(pedido.restaurante_id);
    if (restaurante) {
      destLat = Number(restaurante.latitude);
      destLon = Number(restaurante.longitude);
      logger.info(`Destino: Restaurante (${restaurante.nome})`, 'Simulação');
    } else {
      logger.warn(`Restaurante ${pedido.restaurante_id} não encontrado.`, 'Simulação');
    }
  } else {
    logger.info(`Destino: Cliente`, 'Simulação');
  }

  const rota = await obterRotaEstavel(entregaId);
  if (!rota || !rota.caminho || rota.caminho.length === 0) {
    logger.error(`Falha crítica: Rota não encontrada para a entrega ${entregaId}`, 'Simulação');
    return false;
  }

  const pontos = [...rota.caminho];
  logger.info(`Rota carregada: ${pontos.length} pontos disponíveis.`, 'Simulação');

  const interval = setInterval(async () => {
    if (pontos.length === 0) {
      clearInterval(interval);
      activeSimulations.delete(entregaIdNum);
      
      if (currentStatus === 'ATRIBUIDA') {
        logger.info(`Sucesso: Chegou ao Restaurante. Atualizando para EM_TRANSITO.`, 'Simulação');
        await editarPorId(entregaId, { status: 'EM_TRANSITO' });
      } else {
        logger.info(`Sucesso: Chegou ao Cliente. Finalizando entrega.`, 'Simulação');
        await editarPorId(entregaId, { status: 'ENTREGUE' });
        await entregadorService.atualizarStatus(motorista.id!, 'DISPONIVEL');
        entregadorService.liberarDeSimulacao(motorista.id!);
      }
      return;
    }

    const ponto = pontos.shift();
    if (!ponto) return;

    try {
      if (pontos.length % 5 === 0) {
        logger.debug(`Motoboy ${motorista.nome} em: ${ponto.latitude.toFixed(5)}, ${ponto.longitude.toFixed(5)} (${pontos.length} restantes)`, 'Simulação');
      }
      await entregadorService.atualizarLocalizacao(motorista.id!, ponto.latitude, ponto.longitude);
    } catch (e: any) {
      logger.error(`Erro no deslocamento simulado: ${e.message}`, 'Simulação');
    }
  }, 1000);

  activeSimulations.set(entregaIdNum, interval);
  return true;
};

export const obterRotaEstavel = async (entregaId: number | string): Promise<any> => {
  const entrega = await buscarPorId(entregaId);
  if (!entrega) return null;

  const currentStatus = (entrega.status || "").trim().toUpperCase();
  const cacheKey = `${entregaId}_${currentStatus}`;

  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey);
  }

  for (const key of routeCache.keys()) {
    if (key.startsWith(`${entregaId}_`)) routeCache.delete(key);
  }

  const pedido = await pedidoRepository.buscarPedidoPorId(entrega.pedido_id);
  const motorista = await entregadorService.buscarPorId(entrega.entregador_id);
  
  if (!pedido || !motorista) return null;

  let destLat: number | null = pedido.destino_latitude;
  let destLon: number | null = pedido.destino_longitude;

  if (currentStatus === 'ATRIBUIDA') {
    const restaurante = await restauranteRepository.buscarRestaurantePorId(pedido.restaurante_id);
    if (restaurante) {
      destLat = restaurante.latitude;
      destLon = restaurante.longitude;
    }
  }

  if (destLat == null || destLon == null) return null;

  try {
    const rota = await roteamentoService.obterGeometria(
      Number(motorista.latitude), 
      Number(motorista.longitude), 
      Number(destLat), 
      Number(destLon)
    );
    if (rota && rota.caminho && rota.caminho.length > 0) {
      routeCache.set(cacheKey, rota);
    }
    return rota;
  } catch (err: any) {
    logger.error(`Erro crítico ao calcular cache rota: ${err.message}`, 'Cache Rota');
    return null;
  }
};

export const obterRotaColeta = async (entregaId: number | string): Promise<any> => {
  const entrega = await buscarPorId(entregaId);
  if (!entrega) return null;

  const currentStatus = (entrega.status || "").trim().toUpperCase();
  if (currentStatus !== 'ATRIBUIDA') return null;

  const pedido = await pedidoRepository.buscarPedidoPorId(entrega.pedido_id);
  const motorista = await entregadorService.buscarPorId(entrega.entregador_id);
  if (!pedido || !motorista) return null;

  const restaurante = await restauranteRepository.buscarRestaurantePorId(pedido.restaurante_id);
  if (!restaurante || restaurante.latitude == null || restaurante.longitude == null) return null;

  try {
    return await roteamentoService.obterGeometria(
      Number(motorista.latitude), 
      Number(motorista.longitude), 
      Number(restaurante.latitude), 
      Number(restaurante.longitude)
    );
  } catch (err) {
    return null;
  }
};

export const obterRotaEntrega = async (entregaId: number | string): Promise<any> => {
  const entrega = await buscarPorId(entregaId);
  if (!entrega) return null;

  const pedido = await pedidoRepository.buscarPedidoPorId(entrega.pedido_id);
  const motorista = await entregadorService.buscarPorId(entrega.entregador_id);
  if (!pedido || !motorista) return null;

  const restaurante = await restauranteRepository.buscarRestaurantePorId(pedido.restaurante_id);
  if (!restaurante) return null;

  const currentStatus = (entrega.status || "").trim().toUpperCase();

  let startLat = restaurante.latitude;
  let startLon = restaurante.longitude;

  if (currentStatus === 'EM_TRANSITO') {
    startLat = motorista.latitude;
    startLon = motorista.longitude;
  }

  if (startLat == null || startLon == null) return null;

  try {
    return await roteamentoService.obterGeometria(
      Number(startLat), 
      Number(startLon), 
      Number(pedido.destino_latitude), 
      Number(pedido.destino_longitude)
    );
  } catch (err) {
    return null;
  }
};
