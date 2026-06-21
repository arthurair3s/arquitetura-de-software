import { diContainer } from '../../../shared/infrastructure/container.js'
import { createPagamentoQuery } from './pagamentoQuery.js'
import { createPagamentoMutation } from './pagamentoMutation.js'

const service = diContainer.getPagamentoService()
const processarPagamentoUseCase = diContainer.getProcessarPagamentoUseCase()
const pedidoService = diContainer.getPedidoService()

export const pagamentoResolver = {
  Query: createPagamentoQuery(service),
  Mutation: createPagamentoMutation(service, processarPagamentoUseCase),
  Pagamento: {
    // busca do pedido relacionado
    pedido: async (parent: any) => {
      if (!parent.pedido_id) return null
      return pedidoService.buscarPorId(parent.pedido_id)
    }
  }
}
