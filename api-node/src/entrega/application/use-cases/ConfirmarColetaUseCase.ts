import type { IEntregaRepository } from '../../domain/ports/IEntregaRepository.js'
import type { IPedidoService } from '../../../pedido/application/ports/IPedidoService.js'
import { Entrega, EntregaInvalidaError } from '../../domain/Entrega.js'
import { logger } from '../../../shared/utils/logger.js'

export class ConfirmarColetaUseCase {
  constructor(
    private readonly repository: IEntregaRepository,
    private readonly pedidoService: IPedidoService
  ) {}

  async execute(entregaId: number | string): Promise<Entrega> {
    const entrega = await this.repository.buscarEntregaPorId(entregaId);
    if (!entrega) {
      throw new EntregaInvalidaError('Entrega não encontrada');
    }

    entrega.status = 'EM_TRANSITO';
    const result = await this.repository.editarEntregaPorId(entregaId, entrega);

    try {
      const pedido = await this.pedidoService.buscarPorId(entrega.pedido_id);
      if (pedido) {
        await this.pedidoService.editarPorId(pedido.id!, { status: 'SAIU_PARA_ENTREGA' });
        logger.info(`Pedido #${pedido.id} atualizado para SAIU_PARA_ENTREGA por coleta confirmada`, 'ConfirmarColetaUseCase');
      }
    } catch (err) {
      logger.error(`Erro ao atualizar pedido #${entrega.pedido_id} para SAIU_PARA_ENTREGA: ${err}`, 'ConfirmarColetaUseCase');
    }

    return result;
  }
}
