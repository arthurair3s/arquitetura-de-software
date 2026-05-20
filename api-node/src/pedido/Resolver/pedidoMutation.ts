import type { PedidoAppService } from '../application/pedidoService.js'
import { GraphQLError } from 'graphql'
import { criarPedidoSchema, editarPedidoSchema } from '../application/pedidoValidation.js'
import { withDomainErrorHandling } from '../../shared/utils/errorHandler.js'

export const createPedidoMutation = (service: PedidoAppService) => ({
  criarPedido: async (_: any, args: any) => {
    const parsed = criarPedidoSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    return withDomainErrorHandling(() => service.criar(parsed.data as any))
  },

  editarPedido: async (_: any, args: any) => {
    const parsed = editarPedidoSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    const { id, ...dados } = parsed.data as any
    return withDomainErrorHandling(() => service.editarPorId(id, dados))
  },

  deletarPedido: async (_: any, { id }: { id: string }) => 
    withDomainErrorHandling(async () => !!(await service.deletar(id)))
})
