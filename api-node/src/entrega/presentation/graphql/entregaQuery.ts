import type { IEntregaService } from '../../application/ports/IEntregaService.js'

export const createEntregaQuery = (service: IEntregaService) => ({
  entregas: async () => service.listar(),
  entrega: async (_: any, { id }: { id: string }) => service.buscarPorId(id)
})
