import type { IAvaliacaoService } from '../../application/ports/IAvaliacaoService.js'

export const createAvaliacaoQuery = (service: IAvaliacaoService) => ({
  avaliacoes: async () => service.listar(),
  avaliacao: async (_: any, { id }: { id: string }) => service.buscarPorId(id)
})
