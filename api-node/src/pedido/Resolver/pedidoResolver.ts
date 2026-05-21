import { Query } from './pedidoQuery.js'
import { Mutation } from './pedidoMutation.js'
import * as usuarioService from '../../usuario/usuarioService.js'

export const pedidoResolver = {
  Query,
  Mutation,
  Pedido: {
    usuario: async (parent: any) => {
      if (!parent.usuario_id) return null
      return usuarioService.buscarPorId(parent.usuario_id)
    }
  },
  Usuario: {
    pedidos: async (parent: any) => {
      if (!parent.id) return []
      return import('../../pedido/pedidoService.js').then(s => s.buscarPorUsuarioId(parent.id))
    }
  }
}
