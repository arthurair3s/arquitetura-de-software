import { Query } from './entregaQuery.js'
import { Mutation } from './entregaMutation.js'
import * as pedidoService from '../../pedido/pedidoService.js'
import * as entregadorService from '../../entregador/entregadorService.js'
import * as entregaService from '../entregaService.js'

export const entregaResolver = {
  Query,
  Mutation,
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
      return entregaService.obterRotaEstavel(parent.id)
    },
    rota_coleta: async (parent: any) => {
      if (!parent.id) return null
      return entregaService.obterRotaColeta(parent.id)
    },
    rota_entrega: async (parent: any) => {
      if (!parent.id) return null
      return entregaService.obterRotaEntrega(parent.id)
    }
  },
  Pedido: {
    entregas: async (parent: any) => {
      if (!parent.id) return []
      return entregaService.buscarPorPedidoId(parent.id)
    }
  },
  Entregador: {
    entregas: async (parent: any) => {
      if (!parent.id) return []
      return entregaService.buscarPorEntregadorId(parent.id)
    }
  }
}
