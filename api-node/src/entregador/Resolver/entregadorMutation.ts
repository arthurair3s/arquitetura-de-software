import * as entregadorService from '../entregadorService.js'

export const Mutation = {
  criarEntregador: async (_: any, args: any) => entregadorService.criar(args),

  editarEntregador: async (_: any, args: any) => {
    const { id, ...dados } = args
    return entregadorService.editarPorId(id, dados)
  },

  deletarEntregador: async (_: any, { id }: { id: string }) => !!(await entregadorService.deletar(id)),

  atualizarStatusEntregador: async (_: any, { id, novoStatus }: { id: string; novoStatus: string }) => {
    return entregadorService.atualizarStatus(id, novoStatus)
  },

  atualizarLocalizacaoEntregador: async (_: any, { id, latitude, longitude }: { id: string; latitude: number; longitude: number }) => {
    return entregadorService.atualizarLocalizacao(id, latitude, longitude)
  },

  povoarFrota: async () => entregadorService.povoarFrota()
}
