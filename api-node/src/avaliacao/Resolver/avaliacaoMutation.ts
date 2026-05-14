import type { AvaliacaoAppService } from '../application/avaliacaoService.js'

export const createAvaliacaoMutation = (service: AvaliacaoAppService) => ({
  criarAvaliacao: async (_: any, args: {
    usuario_id: string
    restaurante_id: string
    nota: number
    comentario?: string
  }) => service.criar(args),

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
