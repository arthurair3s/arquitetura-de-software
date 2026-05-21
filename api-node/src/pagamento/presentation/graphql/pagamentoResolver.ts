import { PagamentoRepository } from '../../infrastructure/adapters/pagamentoRepository.js'
import { PagamentoAppService } from '../../application/services/pagamentoService.js'
import { createPagamentoQuery } from './pagamentoQuery.js'
import { createPagamentoMutation } from './pagamentoMutation.js'
import { PedidoAppService } from '../../../pedido/application/services/pedidoService.js'
import { PedidoRepository } from '../../../pedido/infrastructure/adapters/pedidoRepository.js'
import { UsuarioAppService } from '../../../usuario/application/services/usuarioService.js'
import { JwtTokenService } from '../../../shared/infrastructure/JwtTokenService.js'
import { UsuarioRepository } from '../../../usuario/infrastructure/adapters/usuarioRepository.js'
const pedidoService = new PedidoAppService(
  new PedidoRepository(),
  new UsuarioAppService(new UsuarioRepository(), new JwtTokenService())
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
