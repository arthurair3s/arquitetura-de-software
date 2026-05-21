import type { IItemPedidoService } from '../../application/ports/IItemPedidoService.js'

export const createItemPedidoQuery = (service: IItemPedidoService) => ({
  itensPedido: async () => service.listar(),
  itemPedido: async (_: any, { id }: { id: string }) => service.buscarPorId(id)
})
