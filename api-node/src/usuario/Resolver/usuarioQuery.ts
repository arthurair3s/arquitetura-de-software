import * as usuarioService from '../usuarioService.js'
import { GraphQLError } from 'graphql'

export const Query = {
  usuarios: async () => usuarioService.listar(),
  
  usuario: async (_: any, { id }: { id: string }) => usuarioService.buscarPorId(id),

  me: async (_: any, __: any, context: any) => {
    if (!context.usuario) {
      throw new GraphQLError('Não autorizado', { extensions: { code: 'UNAUTHENTICATED' } })
    }
    return usuarioService.buscarPorId(context.usuario.id)
  }
}
