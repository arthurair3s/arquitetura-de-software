import { diContainer } from '../../../shared/infrastructure/container.js'
import { createEntregadorQuery } from './entregadorQuery.js'
import { createEntregadorMutation } from './entregadorMutation.js'

const service = diContainer.getEntregadorService()
const povoarFrotaUseCase = diContainer.getPovoarFrotaUseCase()
const atualizarLocalizacaoUseCase = diContainer.getAtualizarLocalizacaoEntregadorUseCase()

export const entregadorResolver = {
  Query: createEntregadorQuery(service),
  Mutation: createEntregadorMutation(service, povoarFrotaUseCase, atualizarLocalizacaoUseCase)
}
