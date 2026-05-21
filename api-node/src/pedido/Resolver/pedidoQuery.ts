import type { PedidoAppService } from '../application/pedidoService.js'

export const createPedidoQuery = (service: PedidoAppService) => ({
  pedidos: async () => service.listar(),
  pedido: async (_: any, { id }: { id: string }) => service.buscarPorId(id)
})
