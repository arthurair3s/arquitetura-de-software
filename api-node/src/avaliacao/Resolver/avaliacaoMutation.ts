import * as avaliacaoService from '../avaliacaoService.js'

export const Mutation = {
  criarAvaliacao: async (_: any, args: { 
    usuario_id: string; 
    restaurante_id: string; 
    nota: number; 
    comentario?: string 
  }) => avaliacaoService.criar(args),

  editarAvaliacao: async (_: any, args: { 
    id: string; 
    usuario_id?: string; 
    restaurante_id?: string; 
    nota?: number; 
    comentario?: string 
  }) => {
    const { id, ...dados } = args
    return avaliacaoService.editarPorId(id, dados)
  },

  deletarAvaliacao: async (_: any, { id }: { id: string }) => 
    !!(await avaliacaoService.deletar(id))
}
