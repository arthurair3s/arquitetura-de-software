import { diContainer } from '../../../shared/infrastructure/container.js'
import { createEntregaQuery } from './entregaQuery.js'
import { createEntregaMutation } from './entregaMutation.js'

const service = diContainer.getEntregaService()
const simularDeslocamentoUseCase = diContainer.getSimularDeslocamentoUseCase()
const atribuirMelhorEntregadorUseCase = diContainer.getAtribuirMelhorEntregadorUseCase()
const confirmarColetaUseCase = diContainer.getConfirmarColetaUseCase()
const finalizarEntregaUseCase = diContainer.getFinalizarEntregaUseCase()
const pedidoService = diContainer.getPedidoService()
const entregadorService = diContainer.getEntregadorService()

const obterRotaEstavelUseCase = diContainer.getObterRotaEstavelUseCase()
const obterRotaColetaUseCase = diContainer.getObterRotaColetaUseCase()
const obterRotaEntregaUseCase = diContainer.getObterRotaEntregaUseCase()

export const entregaResolver = {
  Query: createEntregaQuery(service),
  Mutation: createEntregaMutation(
    service,
    simularDeslocamentoUseCase,
    atribuirMelhorEntregadorUseCase,
    confirmarColetaUseCase,
    finalizarEntregaUseCase
  ),
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
      return obterRotaEstavelUseCase.execute(parent.id)
    },
    rota_coleta: async (parent: any) => {
      if (!parent.id) return null
      return obterRotaColetaUseCase.execute(parent.id)
    },
    rota_entrega: async (parent: any) => {
      if (!parent.id) return null
      return obterRotaEntregaUseCase.execute(parent.id)
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
