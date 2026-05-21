import * as categoriaService from '../categoriaService.js'

export const Mutation = {
  criarCategoria: async (_: any, args: { nome: string; restaurante_id: string }) => 
    categoriaService.criar(args),

  editarCategoria: async (_: any, args: { id: string; nome?: string; restaurante_id?: string }) => {
    const { id, ...dados } = args
    const updateData = {
      ...dados,
      restaurante_id: dados.restaurante_id ? Number(dados.restaurante_id) : undefined
    }
    return categoriaService.editarPorId(id, updateData)
  },

  deletarCategoria: async (_: any, { id }: { id: string }) => 
    !!(await categoriaService.deletar(id))
}
