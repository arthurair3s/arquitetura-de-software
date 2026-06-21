import type { IEntregaService } from '../../application/ports/IEntregaService.js'
import type { SimularDeslocamentoUseCase } from '../../application/use-cases/SimularDeslocamentoUseCase.js'
import type { AtribuirMelhorEntregadorUseCase } from '../../application/use-cases/AtribuirMelhorEntregadorUseCase.js'
import { GraphQLError } from 'graphql'
import { criarEntregaSchema, editarEntregaSchema } from '../../application/entregaValidation.js'

export const createEntregaMutation = (
  service: IEntregaService,
  simularDeslocamentoUseCase: SimularDeslocamentoUseCase,
  atribuirMelhorEntregadorUseCase: AtribuirMelhorEntregadorUseCase
) => ({
  criarEntrega: async (_: any, args: any) => {
    const parsed = criarEntregaSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    return service.criar(parsed.data as any)
  },

  editarEntrega: async (_: any, args: any) => {
    const parsed = editarEntregaSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    const { id, ...dados } = parsed.data as any
    return service.editarPorId(id, dados)
  },

  deletarEntrega: async (_: any, { id }: { id: string }) => !!(await service.deletar(id)),

  simularDeslocamento: async (_: any, { id }: { id: string }) => {
    return simularDeslocamentoUseCase.execute(id)
  },

  atribuirEntregador: async (_: any, { pedido_id }: { pedido_id: string }) => {
    return atribuirMelhorEntregadorUseCase.execute(pedido_id)
  }
})
