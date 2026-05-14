import { EntregadorRepository } from '../infrastructure/entregadorRepository.js'
import { EntregadorAppService } from '../application/entregadorService.js'
import { RestauranteRepository } from '../../restaurante/infrastructure/restauranteRepository.js'
import { RestauranteAppService } from '../../restaurante/application/restauranteService.js'
import { GrpcRoteamentoProvider } from '../../roteamento/infrastructure/grpcRoteamentoProvider.js'
import { createEntregadorQuery } from './entregadorQuery.js'
import { createEntregadorMutation } from './entregadorMutation.js'

// inicialização das dependências do módulo
const restauranteService = new RestauranteAppService(new RestauranteRepository())
const roteamentoProvider = new GrpcRoteamentoProvider()
const entregadorRepository = new EntregadorRepository()
const service = new EntregadorAppService(entregadorRepository, restauranteService, roteamentoProvider)

export const entregadorResolver = {
  Query: createEntregadorQuery(service),
  Mutation: createEntregadorMutation(service)
}
