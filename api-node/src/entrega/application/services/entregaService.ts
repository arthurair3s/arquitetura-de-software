import type { IEntregaRepository } from '../../domain/ports/IEntregaRepository.js'
import type { IEntregaService } from '../ports/IEntregaService.js'
import { Entrega, EntregaInvalidaError } from '../../domain/Entrega.js'
import { StatusEntrega } from '../../domain/StatusEntrega.js'

export class EntregaAppService implements IEntregaService {
  constructor(
    private readonly repository: IEntregaRepository
  ) {}

  async listar(): Promise<Entrega[]> {
    return this.repository.listarEntregas()
  }

  async buscarPorId(id: number | string): Promise<Entrega | null> {
    return this.repository.buscarEntregaPorId(id)
  }

  async criar(dados: {
    pedido_id: number | string;
    entregador_id?: number | string | null;
    status?: string;
    previsao_entrega?: string | Date;
  }): Promise<Entrega> {
    const status = new StatusEntrega(dados.status || 'PENDENTE');
    const entrega = new Entrega(
      Number(dados.pedido_id),
      dados.entregador_id != null ? Number(dados.entregador_id) : null,
      status,
      dados.previsao_entrega ? new Date(dados.previsao_entrega) : null
    );
    return this.repository.criarEntrega(entrega)
  }

  async editarPorId(id: number | string, dados: {
    pedido_id?: number | string;
    entregador_id?: number | string | null;
    status?: string;
    previsao_entrega?: string | Date;
  }): Promise<Entrega> {
    const entregaAtual = await this.repository.buscarEntregaPorId(id);
    if (!entregaAtual) {
      throw new EntregaInvalidaError('Entrega não encontrada');
    }

    if (dados.status !== undefined) entregaAtual.alterarStatus(new StatusEntrega(dados.status));
    if (dados.previsao_entrega !== undefined) entregaAtual.previsao_entrega = dados.previsao_entrega ? new Date(dados.previsao_entrega) : null;

    if (dados.entregador_id !== undefined || dados.pedido_id !== undefined) {
      const entregaNova = Entrega.criar({
        id: entregaAtual.id,
        pedido_id: dados.pedido_id !== undefined ? dados.pedido_id : entregaAtual.pedido_id,
        entregador_id: dados.entregador_id !== undefined ? dados.entregador_id : entregaAtual.entregador_id,
        status: entregaAtual.status,
        previsao_entrega: entregaAtual.previsao_entrega
      });
      return this.repository.editarEntregaPorId(id, entregaNova);
    }

    return this.repository.editarEntregaPorId(id, entregaAtual)
  }

  async deletar(id: number | string): Promise<boolean> {
    return this.repository.deletarEntrega(id)
  }

  async buscarPorPedidoId(id: number | string): Promise<Entrega[]> {
    return this.repository.buscarEntregaPorPedidoId(id)
  }

  async buscarPorEntregadorId(id: number | string): Promise<Entrega[]> {
    return this.repository.buscarEntregaPorEntregadorId(id)
  }

  async buscarEntregasPendentes(): Promise<Entrega[]> {
    return this.repository.buscarEntregasPendentes()
  }
}
