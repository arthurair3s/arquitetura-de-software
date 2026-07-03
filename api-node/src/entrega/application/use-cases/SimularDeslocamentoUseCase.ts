import type { IEntregaRepository } from '../../domain/ports/IEntregaRepository.js'
import type { IPedidoService } from '../../../pedido/application/ports/IPedidoService.js'
import type { IEntregadorService } from '../../../entregador/application/ports/IEntregadorService.js'
import type { IRestauranteService } from '../../../restaurante/application/ports/IRestauranteService.js'
import type { ObterRotaEstavelUseCase } from './ObterRotaEstavelUseCase.js'
import type { ConfirmarColetaUseCase } from './ConfirmarColetaUseCase.js'
import type { FinalizarEntregaUseCase } from './FinalizarEntregaUseCase.js'
import { EntregaInvalidaError } from '../../domain/Entrega.js'
import { logger } from '../../../shared/utils/logger.js'

export class SimularDeslocamentoUseCase {
  private static activeSimulations = new Map<number, NodeJS.Timeout>();

  constructor(
    private readonly repository: IEntregaRepository,
    private readonly pedidoService: IPedidoService,
    private readonly entregadorService: IEntregadorService,
    private readonly restauranteService: IRestauranteService,
    private readonly obterRotaEstavelUseCase: ObterRotaEstavelUseCase,
    private readonly confirmarColetaUseCase: ConfirmarColetaUseCase,
    private readonly finalizarEntregaUseCase: FinalizarEntregaUseCase
  ) {}

  /**
   * Cancela uma simulação ativa para a entrega especificada.
   * Chamado quando o usuário atualiza a localização manualmente.
   */
  static cancelar(entregaId: number): void {
    const timeoutId = SimularDeslocamentoUseCase.activeSimulations.get(entregaId);
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
      SimularDeslocamentoUseCase.activeSimulations.delete(entregaId);
      logger.info(`Simulação da entrega ${entregaId} cancelada por override manual.`, 'Simulação');
    }
  }

  async execute(entregaId: number | string): Promise<boolean> {
    const entregaIdNum = Number(entregaId);
    if (SimularDeslocamentoUseCase.activeSimulations.has(entregaIdNum)) return true;

    const entrega = await this.repository.buscarEntregaPorId(entregaId);
    if (!entrega) throw new EntregaInvalidaError('entrega nao encontrada');

    const pedido = await this.pedidoService.buscarPorId(entrega.pedido_id);
    if (entrega.entregador_id == null) throw new EntregaInvalidaError('entrega sem entregador atribuido');
    const motorista = await this.entregadorService.buscarPorId(entrega.entregador_id);
    
    if (!pedido || !motorista) throw new EntregaInvalidaError('pedido ou motorista nao encontrado');

    const currentStatus = (entrega.status || "").trim().toUpperCase();
    logger.info(`Início para entrega ${entregaId}. Status: ${currentStatus}`, 'Simulação');

    this.entregadorService.bloquearParaSimulacao(entrega.entregador_id!);
    await this.entregadorService.atualizarStatus(entrega.entregador_id!, 'EM_ENTREGA');

    let destLat = Number(pedido.destino.latitude);
    let destLon = Number(pedido.destino.longitude);

    if (currentStatus === 'ATRIBUIDA') {
      const restaurante = await this.restauranteService.buscarPorId(pedido.restaurante_id);
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

    const rota = await this.obterRotaEstavelUseCase.execute(entregaId);
    if (!rota || !rota.caminho || rota.caminho.length === 0) {
      logger.error(`Falha crítica: Rota não encontrada para a entrega ${entregaId}`, 'Simulação');
      return false;
    }

    const pontos = [...rota.caminho];
    logger.info(`Rota carregada: ${pontos.length} pontos disponíveis.`, 'Simulação');

    const tick = async () => {
      // Se o entregador foi liberado da simulação (override manual), encerra o loop
      if (!this.entregadorService.estaEmSimulacao(motorista.id!)) {
        SimularDeslocamentoUseCase.activeSimulations.delete(entregaIdNum);
        logger.info(`Simulação da entrega ${entregaIdNum} interrompida por override de localização.`, 'Simulação');
        return;
      }

      if (pontos.length === 0) {
        SimularDeslocamentoUseCase.activeSimulations.delete(entregaIdNum);
        
        if (currentStatus === 'ATRIBUIDA') {
          logger.info(`Sucesso: Chegou ao Restaurante. Chamando ConfirmarColetaUseCase.`, 'Simulação');
          await this.confirmarColetaUseCase.execute(entregaId);
        } else {
          logger.info(`Sucesso: Chegou ao Cliente. Chamando FinalizarEntregaUseCase.`, 'Simulação');
          await this.finalizarEntregaUseCase.execute(entregaId);
        }
        return;
      }

      const ponto = pontos.shift();
      if (ponto) {
        try {
          if (pontos.length % 5 === 0) {
            logger.debug(`Motoboy ${motorista.nome} em: ${ponto.latitude.toFixed(5)}, ${ponto.longitude.toFixed(5)} (${pontos.length} restantes)`, 'Simulação');
          }
          await this.entregadorService.atualizarLocalizacao(motorista.id!, ponto.latitude, ponto.longitude);
        } catch (e: any) {
          logger.error(`Erro no deslocamento simulado: ${e.message}`, 'Simulação');
        }
      }

      const timeoutId = setTimeout(tick, 1000);
      SimularDeslocamentoUseCase.activeSimulations.set(entregaIdNum, timeoutId);
    };

    const timeoutId = setTimeout(tick, 1000);
    SimularDeslocamentoUseCase.activeSimulations.set(entregaIdNum, timeoutId);
    return true;
  }
}
