import type { IPagamentoRepository } from '../domain/IPagamentoRepository.js'
import { Pagamento, PagamentoInvalidoError } from '../domain/Pagamento.js'
import { Dinheiro } from '../../shared/domain/value-objects/Dinheiro.js'
import { StatusPagamento } from '../domain/StatusPagamento.js'

export class PagamentoAppService {
  constructor(private readonly repository: IPagamentoRepository) {}

  async listar(): Promise<Pagamento[]> {
    return this.repository.listarPagamentos()
  }

  async buscarPorId(id: number | string): Promise<Pagamento | null> {
    return this.repository.buscarPagamentoPorId(id)
  }

  async criar(dados: {
    pedido_id: string
    metodo?: string
    status?: string
    valor?: number
  }): Promise<Pagamento> {
    const status = new StatusPagamento(dados.status || 'PENDENTE');
    const pagamento = new Pagamento(
      Number(dados.pedido_id),
      dados.metodo || '',
      new Dinheiro(Number(dados.valor || 0)),
      status
    )
    return this.repository.criarPagamento(pagamento)
  }

  async editarPorId(id: number | string, dados: {
    pedido_id?: string
    metodo?: string
    status?: string
    valor?: number
  }): Promise<Pagamento> {
    const pagamentoAtual = await this.repository.buscarPagamentoPorId(id)
    if (!pagamentoAtual) {
      throw new PagamentoInvalidoError('Pagamento não encontrado')
    }
    if (dados.metodo !== undefined) pagamentoAtual.metodo = dados.metodo
    if (dados.status !== undefined) pagamentoAtual.status = dados.status
    if (dados.valor !== undefined) pagamentoAtual.valorObj = new Dinheiro(Number(dados.valor))
    return this.repository.editarPagamentoPorId(id, pagamentoAtual)
  }

  async deletar(id: number | string): Promise<boolean> {
    return this.repository.deletarPagamento(id)
  }
}
