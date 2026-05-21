import type { ICategoriaService } from '../../application/ports/ICategoriaService.js'

export const createCategoriaMutation = (service: ICategoriaService) => ({
  criarCategoria: async (_: any, args: { nome: string; restaurante_id: string }) =>
    service.criar(args),

  editarCategoria: async (_: any, args: { id: string; nome?: string; restaurante_id?: string }) => {
    const { id, ...dados } = args
    const updateData = {
      ...dados,
      restaurante_id: dados.restaurante_id ? Number(dados.restaurante_id) : undefined
    }
    return service.editarPorId(id, updateData)
  },

  deletarCategoria: async (_: any, { id }: { id: string }) =>
    !!(await service.deletar(id))
})
