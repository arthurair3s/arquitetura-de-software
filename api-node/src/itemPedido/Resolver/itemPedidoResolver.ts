import { ItemPedidoRepository } from '../infrastructure/itemPedidoRepository.js'
import { ItemPedidoAppService } from '../application/itemPedidoService.js'
import { ProdutoRepository } from '../../produto/infrastructure/produtoRepository.js'
import { ProdutoAppService } from '../../produto/application/produtoService.js'
import { createItemPedidoQuery } from './itemPedidoQuery.js'
import { createItemPedidoMutation } from './itemPedidoMutation.js'
import { PedidoAppService } from '../../pedido/application/pedidoService.js'
import { PedidoRepository } from '../../pedido/infrastructure/pedidoRepository.js'
import { UsuarioAppService } from '../../usuario/application/services/usuarioService.js'
import { JwtTokenService } from '../../shared/infrastructure/JwtTokenService.js'
import { UsuarioRepository } from '../../usuario/infrastructure/adapters/usuarioRepository.js'
const pedidoService = new PedidoAppService(
  new PedidoRepository(),
  new UsuarioAppService(new UsuarioRepository(), new JwtTokenService())
)

// inicialização das dependências do módulo
const repository = new ItemPedidoRepository()
const service = new ItemPedidoAppService(repository)

// serviço de produto para associações
const produtoService = new ProdutoAppService(new ProdutoRepository())

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
