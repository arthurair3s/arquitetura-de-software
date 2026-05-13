import * as itemPedidoService from '../itemPedidoService.js'

export const Query = {
  itensPedido: async () => itemPedidoService.listar(),
  itemPedido: async (_: any, { id }: { id: string }) => itemPedidoService.buscarPorId(id)
}
