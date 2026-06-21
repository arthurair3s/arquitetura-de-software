import type { IEntregadorService } from '../../application/ports/IEntregadorService.js'
import type { PovoarFrotaUseCase } from '../../application/use-cases/PovoarFrotaUseCase.js'
import type { AtualizarLocalizacaoEntregadorUseCase } from '../../application/use-cases/AtualizarLocalizacaoEntregadorUseCase.js'
import { GraphQLError } from 'graphql'
import { criarEntregadorSchema, editarEntregadorSchema } from '../../application/entregadorValidation.js'

export const createEntregadorMutation = (
  service: IEntregadorService,
  povoarFrotaUseCase: PovoarFrotaUseCase,
  atualizarLocalizacaoUseCase: AtualizarLocalizacaoEntregadorUseCase
) => ({
  criarEntregador: async (_: any, args: any) => {
    const parsed = criarEntregadorSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    return service.criar(parsed.data)
  },

  editarEntregador: async (_: any, args: any) => {
    const parsed = editarEntregadorSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    const { id, ...dados } = parsed.data as any
    return service.editarPorId(id, dados)
  },

  deletarEntregador: async (_: any, { id }: { id: string }) => !!(await service.deletar(id)),

  atualizarStatusEntregador: async (_: any, { id, novoStatus }: { id: string; novoStatus: string }) => {
    return service.atualizarStatus(id, novoStatus)
  },

  atualizarLocalizacaoEntregador: async (_: any, { id, latitude, longitude }: { id: string; latitude: number; longitude: number }) => {
    return atualizarLocalizacaoUseCase.execute(id, latitude, longitude)
  },

  povoarFrota: async () => povoarFrotaUseCase.execute()
})
