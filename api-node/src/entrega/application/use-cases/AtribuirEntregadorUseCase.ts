import type { IEntregaRepository } from '../../domain/ports/IEntregaRepository.js';
import { Entrega } from '../../domain/Entrega.js';
import { StatusEntrega } from '../../domain/StatusEntrega.js';

export interface AtribuirEntregadorInput {
  pedido_id: number | string;
  entregador_id: number | string;
  status?: string;
  previsao_entrega?: string | Date;
}

export class AtribuirEntregadorUseCase {
  constructor(private readonly repository: IEntregaRepository) {}

  async execute(dados: AtribuirEntregadorInput): Promise<Entrega | null> {
    const pedidoId = Number(dados.pedido_id);
    
    // verifica se a entrega ja existe para este pedido
    const existing = await this.repository.buscarEntregaPorPedidoId(pedidoId);
    if (existing && existing.length > 0) {
      const entregaExistente = existing[0];
      const entregaNova = Entrega.criar({
        id: entregaExistente.id,
        pedido_id: entregaExistente.pedido_id,
        entregador_id: Number(dados.entregador_id),
        status: dados.status || 'ATRIBUIDA',
        previsao_entrega: dados.previsao_entrega ? new Date(dados.previsao_entrega) : entregaExistente.previsao_entrega
      });
      const result = await this.repository.editarEntregaPorId(entregaExistente.id!, entregaNova);
      console.log(`[AtribuirEntregadorUseCase] Entrega existente para o pedido ${pedidoId} atualizada no banco de dados:`, result);
      return result;
    }

    const statusObj = new StatusEntrega(dados.status || 'ATRIBUIDA');
    const entrega = new Entrega(
      pedidoId,
      Number(dados.entregador_id),
      statusObj,
      dados.previsao_entrega ? new Date(dados.previsao_entrega) : null
    );

    const result = await this.repository.criarEntrega(entrega);
    console.log(`[AtribuirEntregadorUseCase] Entrega criada no banco de dados:`, result);
    return result;
  }
}
