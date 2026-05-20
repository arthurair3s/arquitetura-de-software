import type { EntregaAppService } from './entregaService.js'
import type { IPedidoService } from '../../../pedido/application/ports/IPedidoService.js'
import type { EntregadorAppService } from '../../../entregador/application/entregadorService.js'
import type { RestauranteAppService } from '../../../restaurante/application/restauranteService.js'
import type { RotaEntregaService } from './rotaEntregaService.js'
import { EntregaInvalidaError } from '../../domain/Entrega.js'
import { logger } from '../../../shared/utils/logger.js'

export class SimuladorDeslocamentoService {
  private activeSimulations = new Map<number, NodeJS.Timeout>();

  constructor(
    private readonly entregaService: EntregaAppService,
    private readonly pedidoService: IPedidoService,
    private readonly entregadorService: EntregadorAppService,
    private readonly restauranteService: RestauranteAppService,
    private readonly rotaService: RotaEntregaService
  ) {}

  async simularDeslocamento(entregaId: number | string): Promise<boolean> {
    const entregaIdNum = Number(entregaId);
    if (this.activeSimulations.has(entregaIdNum)) return true;

    const entrega = await this.entregaService.buscarPorId(entregaId);
    if (!entrega) throw new EntregaInvalidaError('entrega nao encontrada');

    const pedido = await this.pedidoService.buscarPorId(entrega.pedido_id);
    const motorista = await this.entregadorService.buscarPorId(entrega.entregador_id);
    
    if (!pedido || !motorista) throw new EntregaInvalidaError('pedido ou motorista nao encontrado');

    const currentStatus = (entrega.status || "").trim().toUpperCase();
    logger.info(`Início para entrega ${entregaId}. Status: ${currentStatus}`, 'Simulação');

    this.entregadorService.bloquearParaSimulacao(entrega.entregador_id);
    await this.entregadorService.atualizarStatus(entrega.entregador_id, 'EM_ENTREGA');

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

    const rota = await this.rotaService.obterRotaEstavel(entregaId);
    if (!rota || !rota.caminho || rota.caminho.length === 0) {
      logger.error(`Falha crítica: Rota não encontrada para a entrega ${entregaId}`, 'Simulação');
      return false;
    }

    const pontos = [...rota.caminho];
    logger.info(`Rota carregada: ${pontos.length} pontos disponíveis.`, 'Simulação');

    const interval = setInterval(async () => {
      if (pontos.length === 0) {
        clearInterval(interval);
        this.activeSimulations.delete(entregaIdNum);
        
        if (currentStatus === 'ATRIBUIDA') {
          logger.info(`Sucesso: Chegou ao Restaurante. Atualizando para EM_TRANSITO.`, 'Simulação');
          await this.entregaService.editarPorId(entregaId, { status: 'EM_TRANSITO' });
        } else {
          logger.info(`Sucesso: Chegou ao Cliente. Finalizando entrega.`, 'Simulação');
          await this.entregaService.editarPorId(entregaId, { status: 'ENTREGUE' });
          await this.entregadorService.atualizarStatus(motorista.id!, 'DISPONIVEL');
          this.entregadorService.liberarDeSimulacao(motorista.id!);
        }
        return;
      }

      const ponto = pontos.shift();
      if (!ponto) return;

      try {
        if (pontos.length % 5 === 0) {
          logger.debug(`Motoboy ${motorista.nome} em: ${ponto.latitude.toFixed(5)}, ${ponto.longitude.toFixed(5)} (${pontos.length} restantes)`, 'Simulação');
        }
        await this.entregadorService.atualizarLocalizacao(motorista.id!, ponto.latitude, ponto.longitude);
      } catch (e: any) {
        logger.error(`Erro no deslocamento simulado: ${e.message}`, 'Simulação');
      }
    }, 1000);

    this.activeSimulations.set(entregaIdNum, interval);
    return true;
  }
}
