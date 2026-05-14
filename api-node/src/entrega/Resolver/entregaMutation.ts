import * as entregaService from '../entregaService.js'
import { GraphQLError } from 'graphql'
import { criarEntregaSchema, editarEntregaSchema } from '../entregaValidation.js'

export const Mutation = {
  criarEntrega: async (_: any, args: any) => {
    const parsed = criarEntregaSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    return entregaService.criar(parsed.data as any)
  },

  editarEntrega: async (_: any, args: any) => {
    const parsed = editarEntregaSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    const { id, ...dados } = parsed.data as any
    return entregaService.editarPorId(id, dados)
  },

  deletarEntrega: async (_: any, { id }: { id: string }) => !!(await entregaService.deletar(id)),

  simularDeslocamento: async (_: any, { id }: { id: string }) => {
    return entregaService.simularDeslocamento(id)
  },

  atribuirEntregador: async (_: any, { pedido_id }: { pedido_id: string }) => {
    return entregaService.atribuirMelhorEntregador(pedido_id)
  }
}
