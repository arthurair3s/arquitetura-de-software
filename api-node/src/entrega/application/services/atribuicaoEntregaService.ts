import type { EntregaAppService } from './entregaService.js'
import type { IPedidoService } from '../../../pedido/application/ports/IPedidoService.js'
import type { EntregadorAppService } from '../../../entregador/application/entregadorService.js'
import type { RestauranteAppService } from '../../../restaurante/application/restauranteService.js'
import type { IRoteamentoService } from '../../../roteamento/application/ports/IRoteamentoService.js'
import { Entrega, EntregaInvalidaError } from '../../domain/Entrega.js'
import { logger } from '../../../shared/utils/logger.js'

export class AtribuicaoEntregaService {
  constructor(
    private readonly entregaService: EntregaAppService,
    private readonly pedidoService: IPedidoService,
    private readonly restauranteService: RestauranteAppService,
    private readonly entregadorService: EntregadorAppService,
    private readonly roteamentoService: IRoteamentoService
  ) {}

  async atribuirMelhorEntregador(pedidoId: number | string): Promise<Entrega> {
    const pedido = await this.pedidoService.buscarPorId(pedidoId)
    if (!pedido) throw new EntregaInvalidaError('Pedido não encontrado.')

    const restaurante = await this.restauranteService.buscarPorId(pedido.restaurante_id)
    if (!restaurante || restaurante.latitude == null || restaurante.longitude == null) {
      throw new EntregaInvalidaError('Restaurante sem coordenadas geográficas cadastradas.')
    }

    let candidatos = await this.entregadorService.listarProximosAoRestaurante(restaurante.id!, 2.0)
    
    if (!candidatos || candidatos.length === 0) {
      logger.info(`Ninguém a 2.0km. Tentando busca elástica de 3.5km...`, 'EntregaService');
      candidatos = await this.entregadorService.listarProximosAoRestaurante(restaurante.id!, 3.5);
    }

    let melhor = null
    let etaFinal = 0

    if (!candidatos || candidatos.length === 0) {
      logger.warn(`Radar vazio para o restaurante ${restaurante.nome} (ID: ${restaurante.id}). Falha ao encontrar motoboys.`, 'EntregaService');
      throw new EntregaInvalidaError('Nenhum entregador disponível num raio de 3.5km.');
    }

    const disponiveis = candidatos.filter(e => e.statusObj.estaDisponivel())

    if (disponiveis.length === 0) {
      logger.warn('Candidatos no radar estão ocupados. Falhando atribuição.', 'EntregaService');
      throw new EntregaInvalidaError('Todos os entregadores na região estão ocupados no momento.');
    }

    const selecionados = disponiveis.slice(0, 5) 

    const candidatosComEta = await Promise.all(
      selecionados.map(async entregador => {
        try {
          if (!entregador.coordenada || !restaurante.coordenada) {
            return { entregador, eta: Infinity }
          }
          const resumo = await this.roteamentoService.calcularResumo(
            entregador.coordenada,
            restaurante.coordenada
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

    const entrega = await this.entregaService.criar({
      pedido_id: pedidoId,
      entregador_id: melhor.id!,
      status: 'ATRIBUIDA'
    })

    if (melhor.statusObj.estaDisponivel()) {
      try {
        await this.entregadorService.atualizarStatus(melhor.id!, 'EM_ENTREGA')
        logger.info(`Status de ${melhor.nome} alterado para EM_ENTREGA`, 'GRPC');
      } catch (err: any) {
        logger.error(`Falha ao atualizar status do entregador: ${err.message}`, 'GRPC');
      }
    }

    return entrega
  }
}
