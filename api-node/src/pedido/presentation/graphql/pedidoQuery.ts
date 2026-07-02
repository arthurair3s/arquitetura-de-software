import type { IPedidoService } from '../../application/ports/IPedidoService.js'

export const createPedidoQuery = (service: IPedidoService) => ({
  pedidos: async () => service.listar(),
  pedido: async (_: any, { id }: { id: string }) => service.buscarPorId(id),
  pedidosPorRestaurante: async (_: any, { restaurante_id }: { restaurante_id: string }) => service.buscarPorRestauranteId(restaurante_id)
})
