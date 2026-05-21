import type { CategoriaAppService } from '../application/categoriaService.js'

export const createCategoriaQuery = (service: CategoriaAppService) => ({
  categorias: async () => service.listar(),
  categoria: async (_: any, { id }: { id: string }) => service.buscarPorId(id)
})
