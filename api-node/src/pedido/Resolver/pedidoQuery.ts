import * as pedidoService from '../pedidoService.js'

export const Query = {
  pedidos: async () => pedidoService.listar(),
  pedido: async (_: any, { id }: { id: string }) => pedidoService.buscarPorId(id)
}
