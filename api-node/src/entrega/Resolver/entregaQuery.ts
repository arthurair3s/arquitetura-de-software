import * as entregaService from '../entregaService.js'

export const Query = {
  entregas: async () => entregaService.listar(),
  entrega: async (_: any, { id }: { id: string }) => entregaService.buscarPorId(id)
}
