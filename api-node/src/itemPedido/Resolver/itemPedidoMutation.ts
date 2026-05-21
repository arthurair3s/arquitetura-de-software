import * as itemPedidoService from '../itemPedidoService.js'
import { GraphQLError } from 'graphql'
import { criarItemPedidoSchema, editarItemPedidoSchema } from '../itemPedidoValidation.js'

export const Mutation = {
  criarItemPedido: async (_: any, args: { pedido_id: string; produto_id: string; quantidade: number; preco_unitario: number }) => {
    const parsed = criarItemPedidoSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    return itemPedidoService.criar(parsed.data as any)
  },

  editarItemPedido: async (_: any, args: { id: string; quantidade?: number; preco_unitario?: number }) => {
    const parsed = editarItemPedidoSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    const { id, ...dados } = parsed.data as any
    return itemPedidoService.editarPorId(id, dados)
  },

  deletarItemPedido: async (_: any, { id }: { id: string }) => !!(await itemPedidoService.deletar(id))
}
