import { prisma } from '../../infra/database/connection.js'
import { Pagamento } from '../domain/Pagamento.js'
import type { IPagamentoRepository } from '../domain/IPagamentoRepository.js'

export class PagamentoRepository implements IPagamentoRepository {
  async listarPagamentos(): Promise<Pagamento[]> {
    const pagamentos = await prisma.pagamentos.findMany()
    return pagamentos.map((p) => Pagamento.criar(p))
  }

  async buscarPagamentoPorId(id: number | string): Promise<Pagamento | null> {
    const pagamento = await prisma.pagamentos.findUnique({
      where: { id: Number(id) }
    })
    if (!pagamento) return null
    return Pagamento.criar(pagamento)
  }

  async criarPagamento(pagamento: Pagamento): Promise<Pagamento> {
    const novoPagamento = await prisma.pagamentos.create({
      data: {
        pedido_id: pagamento.pedido_id != null ? Number(pagamento.pedido_id) : undefined,
        metodo: pagamento.metodo,
        status: pagamento.status,
        valor: pagamento.valor
      }
    })
    return Pagamento.criar(novoPagamento)
  }

  async editarPagamentoPorId(id: number | string, pagamento: Partial<Pagamento>): Promise<Pagamento> {
    const pagamentoAtualizado = await prisma.pagamentos.update({
      where: { id: Number(id) },
      data: {
        pedido_id: pagamento.pedido_id != null ? Number(pagamento.pedido_id) : undefined,
        metodo: pagamento.metodo,
        status: pagamento.status,
        valor: pagamento.valor != null ? Number(pagamento.valor) : undefined
      }
    })
    return Pagamento.criar(pagamentoAtualizado)
  }

  async deletarPagamento(id: number | string): Promise<boolean> {
    await prisma.pagamentos.delete({
      where: { id: Number(id) }
    })
    return true
  }
}
