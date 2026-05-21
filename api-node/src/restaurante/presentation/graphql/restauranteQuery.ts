import type { IRestauranteService } from '../../application/ports/IRestauranteService.js'

export const createRestauranteQuery = (service: IRestauranteService) => ({
  restaurantes: async () => service.listar(),
  restaurante: async (_: any, { id }: { id: string }) => service.buscarPorId(id)
})
