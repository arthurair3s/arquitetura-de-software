import { ItemPedido } from '../ItemPedido.js'

export interface IItemPedidoRepository {
  listarItensPedido(): Promise<ItemPedido[]>
  buscarItemPedidoPorId(id: number | string): Promise<ItemPedido | null>
  buscarItensPorPedidoId(pedido_id: number | string): Promise<ItemPedido[]>
  criarItemPedido(item: ItemPedido): Promise<ItemPedido>
  editarItemPedidoPorId(id: number | string, item: Partial<ItemPedido>): Promise<ItemPedido>
  deletarItemPedido(id: number | string): Promise<boolean>
}
