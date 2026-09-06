import { diContainer } from '../../../shared/infrastructure/container.js'
import { createRestauranteQuery } from './restauranteQuery.js'
import { createRestauranteMutation } from './restauranteMutation.js'

const service = diContainer.getRestauranteService()

export const restauranteResolver = {
  Query: createRestauranteQuery(service),
  Mutation: createRestauranteMutation(service)
}
