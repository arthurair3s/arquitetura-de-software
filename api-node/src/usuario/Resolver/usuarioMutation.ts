import type { UsuarioAppService } from '../application/usuarioService.js'
import { GraphQLError } from 'graphql'
import {
  loginSchema,
  criarUsuarioSchema,
  editarUsuarioSchema,
  atualizarEnderecoSchema
} from '../application/usuarioValidation.js'
import { withDomainErrorHandling } from '../../shared/utils/errorHandler.js'

export const createUsuarioMutation = (service: UsuarioAppService) => ({
  login: async (_: any, args: any) => {
    const parsed = loginSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    return withDomainErrorHandling(() => service.login(parsed.data.email, parsed.data.senha))
  },

  criarUsuario: async (_: any, args: any) => {
    const parsed = criarUsuarioSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    return withDomainErrorHandling(() => service.criar(parsed.data))
  },

  editarUsuario: async (_: any, args: any) => {
    const parsed = editarUsuarioSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    const { id, ...dados } = parsed.data as any
    return withDomainErrorHandling(() => service.editarPorId(id, dados))
  },

  atualizarEndereco: async (_: any, args: any, context: any) => {
    if (!context.user) {
      throw new GraphQLError('Não autorizado', { extensions: { code: 'UNAUTHENTICATED' } })
    }
    const parsed = atualizarEnderecoSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    return withDomainErrorHandling(() => service.atualizarEndereco(context.user.id, parsed.data))
  },

  deletarUsuario: async (_: any, { id }: { id: string }) =>
    withDomainErrorHandling(async () => !!(await service.deletar(id)))
})
