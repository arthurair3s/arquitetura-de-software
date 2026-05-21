import { PedidoRepository } from '../../infrastructure/adapters/pedidoRepository.js'
import { PedidoAppService } from '../../application/services/pedidoService.js'
import { UsuarioRepository } from '../../../usuario/infrastructure/adapters/usuarioRepository.js'
import { UsuarioAppService } from '../../../usuario/application/services/usuarioService.js'
import { JwtTokenService } from '../../../shared/infrastructure/JwtTokenService.js'
import { createPedidoQuery } from './pedidoQuery.js'
import { createPedidoMutation } from './pedidoMutation.js'

// inicialização das dependências do módulo
const usuarioService = new UsuarioAppService(new UsuarioRepository(), new JwtTokenService())
const pedidoRepository = new PedidoRepository()
const service = new PedidoAppService(pedidoRepository, usuarioService)

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
