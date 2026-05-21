import type { ICategoriaService } from '../../application/ports/ICategoriaService.js'

export const createCategoriaQuery = (service: ICategoriaService) => ({
  categorias: async () => service.listar(),
  categoria: async (_: any, { id }: { id: string }) => service.buscarPorId(id)
})
