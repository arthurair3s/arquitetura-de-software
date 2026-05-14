import type { ProdutoAppService } from '../application/produtoService.js'

export const createProdutoQuery = (service: ProdutoAppService) => ({
  produtos: async () => service.listar(),
  produto: async (_: any, { id }: { id: string }) => service.buscarPorId(id)
})
