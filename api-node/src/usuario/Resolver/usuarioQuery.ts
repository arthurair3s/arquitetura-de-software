import type { UsuarioAppService } from '../application/usuarioService.js'
import { GraphQLError } from 'graphql'

export const createUsuarioQuery = (service: UsuarioAppService) => ({
  usuarios: async () => service.listar(),

  usuario: async (_: any, { id }: { id: string }) => service.buscarPorId(id),

  me: async (_: any, __: any, context: any) => {
    if (!context.user) {
      throw new GraphQLError('Não autorizado', { extensions: { code: 'UNAUTHENTICATED' } })
    }
    return service.buscarPorId(context.user.id)
  }
})
