import type { IPedidoService } from '../../application/ports/IPedidoService.js'
import { GraphQLError } from 'graphql'
import { criarPedidoSchema, editarPedidoSchema } from '../../application/pedidoValidation.js'
import { withDomainErrorHandling } from '../../../shared/utils/errorHandler.js'
import { diContainer } from '../../../shared/infrastructure/container.js'

export const createPedidoMutation = (service: IPedidoService) => ({
  criarPedido: async (_: any, args: any) => {
    const parsed = criarPedidoSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    const useCase = diContainer.getConfirmarPedidoUseCase()
    return withDomainErrorHandling(() => useCase.execute(parsed.data as any))
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
