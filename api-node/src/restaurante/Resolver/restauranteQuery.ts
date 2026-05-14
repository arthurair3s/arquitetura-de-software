import type { RestauranteAppService } from '../application/restauranteService.js'

export const createRestauranteQuery = (service: RestauranteAppService) => ({
  restaurantes: async () => service.listar(),
  restaurante: async (_: any, { id }: { id: string }) => service.buscarPorId(id)
})
