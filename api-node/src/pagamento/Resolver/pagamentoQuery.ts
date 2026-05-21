import type { PagamentoAppService } from '../application/pagamentoService.js'

export const createPagamentoQuery = (service: PagamentoAppService) => ({
  pagamentos: async () => service.listar(),
  pagamento: async (_: any, { id }: { id: string }) => service.buscarPorId(id)
})
