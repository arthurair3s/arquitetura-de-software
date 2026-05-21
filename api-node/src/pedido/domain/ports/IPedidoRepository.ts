import { Pedido } from '../Pedido.js'

export interface IPedidoRepository {
  listarPedidos(): Promise<Pedido[]>
  buscarPedidoPorId(id: number | string): Promise<Pedido | null>
  buscarPedidoPorUsuarioId(usuario_id: number | string): Promise<Pedido[]>
  criarPedido(pedido: Pedido): Promise<Pedido>
  editarPedidoPorId(id: number | string, pedido: Partial<Pedido>): Promise<Pedido>
  deletarPedido(id: number | string): Promise<boolean>
}
