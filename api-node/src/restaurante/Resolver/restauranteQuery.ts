import * as restauranteService from '../restauranteService.js'

export const Query = {
  restaurantes: async () => restauranteService.listar(),
  restaurante: async (_: any, { id }: { id: string }) => restauranteService.buscarPorId(id)
}
