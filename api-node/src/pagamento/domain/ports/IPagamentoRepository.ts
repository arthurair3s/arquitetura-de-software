import { Pagamento } from '../Pagamento.js'

export interface IPagamentoRepository {
  listarPagamentos(): Promise<Pagamento[]>
  buscarPagamentoPorId(id: number | string): Promise<Pagamento | null>
  criarPagamento(pagamento: Pagamento): Promise<Pagamento>
  editarPagamentoPorId(id: number | string, pagamento: Partial<Pagamento>): Promise<Pagamento>
  deletarPagamento(id: number | string): Promise<boolean>
}
