import type { IUsuarioService } from '../../application/ports/IUsuarioService.js'
import type { LoginUsuarioUseCase } from '../../application/use-cases/LoginUsuarioUseCase.js'
import type { AtualizarEnderecoUsuarioUseCase } from '../../application/use-cases/AtualizarEnderecoUsuarioUseCase.js'
import { GraphQLError } from 'graphql'
import {
  loginSchema,
  criarUsuarioSchema,
  editarUsuarioSchema,
  atualizarEnderecoSchema
} from '../../application/usuarioValidation.js'
import { withDomainErrorHandling } from '../../../shared/utils/errorHandler.js'

/** Uma conta só pode ser alterada ou removida pelo seu próprio dono. */
const exigirDono = (context: any, id: string | number) => {
  if (String(context.user?.id) !== String(id)) {
    throw new GraphQLError('Você só pode alterar a sua própria conta.', {
      extensions: { code: 'FORBIDDEN' }
    })
  }
}

export const createUsuarioMutation = (
  service: IUsuarioService,
  loginUsuarioUseCase: LoginUsuarioUseCase,
  atualizarEnderecoUsuarioUseCase: AtualizarEnderecoUsuarioUseCase
) => ({
  login: async (_: any, args: any) => {
    const parsed = loginSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    return withDomainErrorHandling(() => loginUsuarioUseCase.execute(parsed.data))
  },

  criarUsuario: async (_: any, args: any) => {
    const parsed = criarUsuarioSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    return withDomainErrorHandling(() => service.criar(parsed.data))
  },

  editarUsuario: async (_: any, args: any, context: any) => {
    const parsed = editarUsuarioSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    const { id, ...dados } = parsed.data as any
    exigirDono(context, id)
    return withDomainErrorHandling(() => service.editarPorId(id, dados))
  },

  // A autenticação é garantida pela diretiva @auth no schema.
  atualizarEndereco: async (_: any, args: any, context: any) => {
    const parsed = atualizarEnderecoSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    return withDomainErrorHandling(() => atualizarEnderecoUsuarioUseCase.execute({
      usuario_id: context.user.id,
      ...parsed.data
    }))
  },

  deletarUsuario: async (_: any, { id }: { id: string }, context: any) => {
    exigirDono(context, id)
    return withDomainErrorHandling(async () => !!(await service.deletar(id)))
  }
})
