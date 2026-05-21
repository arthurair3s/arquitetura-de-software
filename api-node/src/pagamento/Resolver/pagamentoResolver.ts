import { PagamentoRepository } from '../infrastructure/pagamentoRepository.js'
import { PagamentoAppService } from '../application/pagamentoService.js'
import { createPagamentoQuery } from './pagamentoQuery.js'
import { createPagamentoMutation } from './pagamentoMutation.js'
import { PedidoAppService } from '../../pedido/application/pedidoService.js'
import { PedidoRepository } from '../../pedido/infrastructure/pedidoRepository.js'
import { UsuarioAppService } from '../../usuario/application/usuarioService.js'
import { UsuarioRepository } from '../../usuario/infrastructure/usuarioRepository.js'
const pedidoService = new PedidoAppService(
  new PedidoRepository(),
  new UsuarioAppService(new UsuarioRepository())
)

// inicialização das dependências do módulo
const repository = new PagamentoRepository()
const service = new PagamentoAppService(repository)

export const pagamentoResolver = {
  Query: createPagamentoQuery(service),
  Mutation: createPagamentoMutation(service),
  Pagamento: {
    // busca do pedido relacionado
    pedido: async (parent: any) => {
      if (!parent.pedido_id) return null
      return pedidoService.buscarPorId(parent.pedido_id)
    }
  }
}
