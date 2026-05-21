import { ItemPedido } from '../../domain/ItemPedido.js'

export interface IItemPedidoService {
  listar(): Promise<ItemPedido[]>
  buscarPorId(id: number | string): Promise<ItemPedido | null>
  buscarItensPorPedidoId(pedido_id: number | string): Promise<ItemPedido[]>
  criar(dados: {
    pedido_id: string | number
    produto_id: string | number
    quantidade: number
    preco_unitario: number
  }): Promise<ItemPedido>
  editarPorId(id: number | string, dados: {
    pedido_id?: string | number
    produto_id?: string | number
    quantidade?: number
    preco_unitario?: number
  }): Promise<ItemPedido>
  deletar(id: number | string): Promise<boolean>
}
