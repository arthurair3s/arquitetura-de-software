import type { EntregaAppService } from '../application/entregaService.js'

export const createEntregaQuery = (service: EntregaAppService) => ({
  entregas: async () => service.listar(),
  entrega: async (_: any, { id }: { id: string }) => service.buscarPorId(id)
})
