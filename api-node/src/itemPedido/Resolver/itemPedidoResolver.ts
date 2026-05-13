import { Query } from './itemPedidoQuery.js'
import { Mutation } from './itemPedidoMutation.js'
import * as pedidoService from '../../pedido/pedidoService.js'
import * as produtoService from '../../produto/produtoService.js'

export const itemPedidoResolver = {
  Query,
  Mutation,
  ItemPedido: {
    pedido: async (parent: any) => {
      if (!parent.pedido_id) return null
      return pedidoService.buscarPorId(parent.pedido_id)
    },
    produto: async (parent: any) => {
      if (!parent.produto_id) return null
      return produtoService.buscarPorId(parent.produto_id)
    }
  }
}
