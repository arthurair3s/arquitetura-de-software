import type { IEntregaRepository } from '../../domain/ports/IEntregaRepository.js'
import type { IPedidoService } from '../../../pedido/application/ports/IPedidoService.js'
import type { IEntregadorService } from '../../../entregador/application/ports/IEntregadorService.js'
import type { IUsuarioService } from '../../../usuario/application/ports/IUsuarioService.js'
import { rabbitMQPublisher } from '../../../shared/infrastructure/messaging/rabbitmqPublisher.js'
import { Entrega, EntregaInvalidaError } from '../../domain/Entrega.js'
import { logger } from '../../../shared/utils/logger.js'

export class FinalizarEntregaUseCase {
  constructor(
    private readonly repository: IEntregaRepository,
    private readonly pedidoService: IPedidoService,
    private readonly entregadorService: IEntregadorService,
    private readonly usuarioService: IUsuarioService
  ) {}

  async execute(entregaId: number | string): Promise<Entrega> {
    const entrega = await this.repository.buscarEntregaPorId(entregaId);
    if (!entrega) {
      throw new EntregaInvalidaError('Entrega não encontrada');
    }

    if (entrega.entregador_id == null) {
      throw new EntregaInvalidaError('Entrega sem entregador atribuído');
    }

    entrega.status = 'ENTREGUE';
    const result = await this.repository.editarEntregaPorId(entregaId, entrega);

    try {
      const pedido = await this.pedidoService.buscarPorId(entrega.pedido_id);
      if (pedido) {
        await this.pedidoService.editarPorId(pedido.id!, { status: 'ENTREGUE' });
        logger.info(`Pedido #${pedido.id} atualizado para ENTREGUE por entrega finalizada`, 'FinalizarEntregaUseCase');

        // Envia notificação por email (evento pedido.entregue)
        const usuario = await this.usuarioService.buscarPorId(pedido.usuario_id);
        if (usuario) {
          await rabbitMQPublisher.publish('pedido.entregue', {
            pedido_id: pedido.id,
            usuario_id: usuario.id,
            usuario_nome: usuario.nome,
            usuario_email: usuario.email
          });
          logger.info(`Evento pedido.entregue publicado para pedido #${pedido.id}`, 'FinalizarEntregaUseCase');
        }
      }
    } catch (err) {
      logger.error(`Erro ao atualizar pedido #${entrega.pedido_id} para ENTREGUE: ${err}`, 'FinalizarEntregaUseCase');
    }

    try {
      const motorista = await this.entregadorService.buscarPorId(entrega.entregador_id);
      if (motorista) {
        await this.entregadorService.atualizarStatus(motorista.id!, 'DISPONIVEL');
        this.entregadorService.liberarDeSimulacao(motorista.id!);
        // Finaliza o stream gRPC persistente
        this.entregadorService.finalizarStreamLocalizacao(motorista.id!);
        logger.info(`Entregador #${motorista.id} liberado e finalizado`, 'FinalizarEntregaUseCase');
      }
    } catch (err) {
      logger.error(`Erro ao liberar entregador #${entrega.entregador_id}: ${err}`, 'FinalizarEntregaUseCase');
    }

    return result;
  }
}
