import type { AvaliacaoAppService } from '../application/avaliacaoService.js'

export const createAvaliacaoQuery = (service: AvaliacaoAppService) => ({
  avaliacoes: async () => service.listar(),
  avaliacao: async (_: any, { id }: { id: string }) => service.buscarPorId(id)
})
