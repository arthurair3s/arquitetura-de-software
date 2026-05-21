import type { ItemPedidoAppService } from '../application/itemPedidoService.js'

export const createItemPedidoQuery = (service: ItemPedidoAppService) => ({
  itensPedido: async () => service.listar(),
  itemPedido: async (_: any, { id }: { id: string }) => service.buscarPorId(id)
})
