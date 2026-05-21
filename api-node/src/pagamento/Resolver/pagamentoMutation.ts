import * as pagamentoService from '../pagamentoService.js'
import { GraphQLError } from 'graphql'
import { criarPagamentoSchema, editarPagamentoSchema } from '../pagamentoValidation.js'

export const Mutation = {
  criarPagamento: async (_: any, args: { pedido_id: string; metodo?: string; status?: string; valor?: number }) => {
    const parsed = criarPagamentoSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    return pagamentoService.criar(parsed.data as any)
  },

  editarPagamento: async (_: any, args: { id: string; pedido_id?: string; metodo?: string; status?: string; valor?: number }) => {
    const parsed = editarPagamentoSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    const { id, ...dados } = parsed.data as any
    return pagamentoService.editarPorId(id, dados)
  },

  deletarPagamento: async (_: any, { id }: { id: string }) => !!(await pagamentoService.deletar(id))
}
