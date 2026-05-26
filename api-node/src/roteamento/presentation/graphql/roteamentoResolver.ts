import { diContainer } from '../../../shared/infrastructure/container.js'
import { createRoteamentoQuery } from './roteamentoQuery.js'

const service = diContainer.getRoteamentoService()

export const roteamentoResolver = {
  Query: createRoteamentoQuery(service)
}
