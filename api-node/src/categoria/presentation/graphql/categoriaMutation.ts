import type { ICategoriaService } from '../../application/ports/ICategoriaService.js'

export const createCategoriaMutation = (service: ICategoriaService) => ({
  criarCategoria: async (_: any, args: { nome: string; restaurante_id: string }) => {
    return service.criar(args)
  },

  editarCategoria: async (_: any, args: { id: string; nome?: string; restaurante_id?: string }) => {
    const { id, ...dados } = args
    const updateData = {
      ...dados,
      restaurante_id: dados.restaurante_id ? Number(dados.restaurante_id) : undefined
    }
    const categoria = await service.editarPorId(id, updateData)
    return categoria
  },

  deletarCategoria: async (_: any, { id }: { id: string }) => {
    const result = !!(await service.deletar(id))
    return result
  }
})
