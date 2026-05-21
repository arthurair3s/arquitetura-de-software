import { RestauranteRepository } from '../../infrastructure/adapters/restauranteRepository.js'
import { RestauranteAppService } from '../../application/services/restauranteService.js'
import { createRestauranteQuery } from './restauranteQuery.js'
import { createRestauranteMutation } from './restauranteMutation.js'

// inicialização das dependências do módulo
const repository = new RestauranteRepository()
const service = new RestauranteAppService(repository)

export const restauranteResolver = {
  Query: createRestauranteQuery(service),
  Mutation: createRestauranteMutation(service)
}
