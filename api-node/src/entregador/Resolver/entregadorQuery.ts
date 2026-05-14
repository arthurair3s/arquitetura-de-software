import * as entregadorService from '../entregadorService.js'

export const Query = {
  entregadores: async () => entregadorService.listar(),
  entregador: async (_: any, { id }: { id: string }) => entregadorService.buscarPorId(id),
  buscarEntregadoresProximos: async (_: any, { latitude, longitude, raioKm }: any) => {
    return entregadorService.listarProximos(latitude, longitude, raioKm)
  },
  entregadoresProximosAoRestaurante: async (_: any, { restauranteId, raioKm }: any) => {
    return entregadorService.listarProximosAoRestaurante(restauranteId, raioKm)
  }
}
