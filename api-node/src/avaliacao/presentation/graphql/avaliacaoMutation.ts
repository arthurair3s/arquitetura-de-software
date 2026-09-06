import type { IAvaliacaoService } from '../../application/ports/IAvaliacaoService.js'

export const createAvaliacaoMutation = (service: IAvaliacaoService) => ({
  criarAvaliacao: async (_: any, args: {
    restaurante_id: string
    nota: number
    comentario?: string
  }, context: any) =>
    // O autor da avaliação é o portador do token.
    service.criar({ ...args, usuario_id: context.user.id }),

  editarAvaliacao: async (_: any, args: {
    id: string
    nota?: number
    comentario?: string
  }) => {
    const { id, ...dados } = args
    return service.editarPorId(id, dados)
  },

  deletarAvaliacao: async (_: any, { id }: { id: string }) =>
    !!(await service.deletar(id))
})
