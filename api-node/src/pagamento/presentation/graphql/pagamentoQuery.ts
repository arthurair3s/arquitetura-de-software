import type { IPagamentoService } from '../../application/ports/IPagamentoService.js'

export const createPagamentoQuery = (service: IPagamentoService) => ({
  pagamentos: async () => service.listar(),
  pagamento: async (_: any, { id }: { id: string }) => service.buscarPorId(id)
})
