import { Pagamento } from '../../domain/Pagamento.js'

export interface IPagamentoService {
  listar(): Promise<Pagamento[]>
  buscarPorId(id: number | string): Promise<Pagamento | null>
  editarPorId(id: number | string, dados: {
    pedido_id?: string
    metodo?: string
    status?: string
    valor?: number
  }): Promise<Pagamento>
  deletar(id: number | string): Promise<boolean>
}
