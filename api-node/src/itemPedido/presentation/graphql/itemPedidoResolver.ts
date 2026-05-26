import { diContainer } from '../../../shared/infrastructure/container.js'
import { createItemPedidoQuery } from './itemPedidoQuery.js'
import { createItemPedidoMutation } from './itemPedidoMutation.js'

const service = diContainer.getItemPedidoService()
const pedidoService = diContainer.getPedidoService()
const produtoService = diContainer.getProdutoService()

export const itemPedidoResolver = {
  Query: createItemPedidoQuery(service),
  Mutation: createItemPedidoMutation(service),
  ItemPedido: {
    // serviço de pedido para associações
    pedido: async (parent: any) => {
      if (!parent.pedido_id) return null
      return pedidoService.buscarPorId(parent.pedido_id)
    },
    produto: async (parent: any) => {
      if (!parent.produto_id) return null
      return produtoService.buscarPorId(parent.produto_id)
    }
  },
  Pedido: {
    itens: async (parent: any) => {
      if (!parent.id) return []
      return service.buscarItensPorPedidoId(parent.id)
    }
  }
}
