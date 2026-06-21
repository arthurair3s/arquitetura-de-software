import type { IPagamentoService } from '../../application/ports/IPagamentoService.js'
import type { ProcessarPagamentoUseCase } from '../../application/use-cases/ProcessarPagamentoUseCase.js'
import { GraphQLError } from 'graphql'
import { criarPagamentoSchema, editarPagamentoSchema } from '../../application/pagamentoValidation.js'

export const createPagamentoMutation = (
  service: IPagamentoService,
  processarPagamentoUseCase: ProcessarPagamentoUseCase
) => ({
  criarPagamento: async (_: any, args: {
    pedido_id: string
    metodo?: string
    status?: string
    valor?: number
  }) => {
    const parsed = criarPagamentoSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    return processarPagamentoUseCase.execute(parsed.data as any)
  },

  editarPagamento: async (_: any, args: {
    id: string
    pedido_id?: string
    metodo?: string
    status?: string
    valor?: number
  }) => {
    const parsed = editarPagamentoSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    const { id, ...dados } = parsed.data as any
    return service.editarPorId(id, dados)
  },

  deletarPagamento: async (_: any, { id }: { id: string }) =>
    !!(await service.deletar(id))
})
