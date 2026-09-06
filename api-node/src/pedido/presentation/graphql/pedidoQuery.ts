import type { IPedidoService } from '../../application/ports/IPedidoService.js'

export const createPedidoQuery = (service: IPedidoService) => ({
  pedidos: async () => service.listar(),
  pedido: async (_: any, { id }: { id: string }) => service.buscarPorId(id),
  pedidosPorRestaurante: async (_: any, { restaurante_id }: { restaurante_id: string }) => service.buscarPorRestauranteId(restaurante_id),

  // sem argumento de identidade: o usuário só consegue listar os próprios pedidos.
  meusPedidos: async (_: any, __: any, context: any) => service.buscarPorUsuarioId(context.user.id)
})
