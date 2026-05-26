import { diContainer } from '../../../shared/infrastructure/container.js'
import { createEntregaQuery } from './entregaQuery.js'
import { createEntregaMutation } from './entregaMutation.js'

const service = diContainer.getEntregaService()
const simuladorService = diContainer.getSimuladorDeslocamentoService()
const atribuicaoService = diContainer.getAtribuicaoEntregaService()
const pedidoService = diContainer.getPedidoService()
const entregadorService = diContainer.getEntregadorService()
const rotaService = diContainer.getRotaEntregaService()

export const entregaResolver = {
  Query: createEntregaQuery(service),
  Mutation: createEntregaMutation(service, simuladorService, atribuicaoService),
  Entrega: {
    pedido: async (parent: any) => {
      if (!parent.pedido_id) return null
      return pedidoService.buscarPorId(parent.pedido_id)
    },
    entregador: async (parent: any) => {
      if (!parent.entregador_id) return null
      return entregadorService.buscarPorId(parent.entregador_id)
    },
    rota: async (parent: any) => {
      if (!parent.id) return null
      return rotaService.obterRotaEstavel(parent.id)
    },
    rota_coleta: async (parent: any) => {
      if (!parent.id) return null
      return rotaService.obterRotaColeta(parent.id)
    },
    rota_entrega: async (parent: any) => {
      if (!parent.id) return null
      return rotaService.obterRotaEntrega(parent.id)
    }
  },
  Pedido: {
    entregas: async (parent: any) => {
      if (!parent.id) return []
      return service.buscarPorPedidoId(parent.id)
    }
  },
  Entregador: {
    entregas: async (parent: any) => {
      if (!parent.id) return []
      return service.buscarPorEntregadorId(parent.id)
    }
  }
}
