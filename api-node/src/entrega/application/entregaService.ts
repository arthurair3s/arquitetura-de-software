import type { IEntregaRepository } from '../domain/IEntregaRepository.js'
import { Entrega, EntregaInvalidaError } from '../domain/Entrega.js'
import { logger } from '../../shared/utils/logger.js'
import { StatusEntrega } from '../domain/StatusEntrega.js'

export class EntregaAppService {
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
    entregador_id: number | string;
    status?: string;
    previsao_entrega?: string | Date;
  }): Promise<Entrega> {
    const status = new StatusEntrega(dados.status || 'ATRIBUIDA');
    const entrega = new Entrega(
      Number(dados.pedido_id),
      Number(dados.entregador_id),
      status,
      dados.previsao_entrega ? new Date(dados.previsao_entrega) : null
    );
    return this.repository.criarEntrega(entrega)
  }

  async editarPorId(id: number | string, dados: {
    pedido_id?: number | string;
    entregador_id?: number | string;
    status?: string;
    previsao_entrega?: string | Date;
  }): Promise<Entrega> {
    const entregaAtual = await this.repository.buscarEntregaPorId(id);
    if (!entregaAtual) {
      throw new EntregaInvalidaError('Entrega não encontrada');
    }

    if (dados.status !== undefined) entregaAtual.status = dados.status;
    if (dados.previsao_entrega !== undefined) entregaAtual.previsao_entrega = dados.previsao_entrega ? new Date(dados.previsao_entrega) : null;

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

}
