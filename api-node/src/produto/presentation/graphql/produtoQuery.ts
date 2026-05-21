import type { IProdutoService } from '../../application/ports/IProdutoService.js'

export const createProdutoQuery = (service: IProdutoService) => ({
  produtos: async () => service.listar(),
  produto: async (_: any, { id }: { id: string }) => service.buscarPorId(id)
})
