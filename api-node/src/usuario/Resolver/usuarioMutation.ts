import * as usuarioService from '../usuarioService.js'
import { GraphQLError } from 'graphql'
import {
  loginSchema,
  criarUsuarioSchema,
  editarUsuarioSchema,
  atualizarEnderecoSchema
} from '../usuarioValidation.js'

export const Mutation = {
  login: async (_: any, args: any) => {
    const parsed = loginSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    return usuarioService.login(parsed.data.email, parsed.data.senha)
  },

  criarUsuario: async (_: any, args: any) => {
    const parsed = criarUsuarioSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    return usuarioService.criar(parsed.data)
  },

  editarUsuario: async (_: any, args: any) => {
    const parsed = editarUsuarioSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    const { id, ...dados } = parsed.data as any
    return usuarioService.editarPorId(id, dados)
  },

  atualizarEndereco: async (_: any, args: any, context: any) => {
    if (!context.usuario) {
      throw new GraphQLError('Não autorizado', { extensions: { code: 'UNAUTHENTICATED' } })
    }
    const parsed = atualizarEnderecoSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    return usuarioService.atualizarEndereco(context.usuario.id, parsed.data)
  },

  deletarUsuario: async (_: any, { id }: { id: string }) => !!(await usuarioService.deletar(id))
}
