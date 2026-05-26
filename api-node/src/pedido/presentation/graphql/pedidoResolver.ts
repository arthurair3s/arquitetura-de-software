import { diContainer } from '../../../shared/infrastructure/container.js'
import { createPedidoQuery } from './pedidoQuery.js'
import { createPedidoMutation } from './pedidoMutation.js'

const service = diContainer.getPedidoService()
const usuarioService = diContainer.getUsuarioService()

export const pedidoResolver = {
  Query: createPedidoQuery(service),
  Mutation: createPedidoMutation(service),
  Pedido: {
    usuario: async (parent: any) => {
      if (!parent.usuario_id) return null
      return usuarioService.buscarPorId(parent.usuario_id)
    }
  },
  Usuario: {
    pedidos: async (parent: any) => {
      if (!parent.id) return []
      return service.buscarPorUsuarioId(parent.id)
    }
  }
}
