import type { EntregadorAppService } from '../application/entregadorService.js'

export const createEntregadorQuery = (service: EntregadorAppService) => ({
  entregadores: async () => service.listar(),
  entregador: async (_: any, { id }: { id: string }) => service.buscarPorId(id),
  buscarEntregadoresProximos: async (_: any, { latitude, longitude, raioKm }: any) => {
    return service.listarProximos(latitude, longitude, raioKm)
  },
  entregadoresProximosAoRestaurante: async (_: any, { restauranteId, raioKm }: any) => {
    return service.listarProximosAoRestaurante(restauranteId, raioKm)
  }
})
