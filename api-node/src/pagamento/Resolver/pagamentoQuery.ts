import * as pagamentoService from '../pagamentoService.js'

export const Query = {
  pagamentos: async () => pagamentoService.listar(),
  pagamento: async (_: any, { id }: { id: string }) => pagamentoService.buscarPorId(id)
}
