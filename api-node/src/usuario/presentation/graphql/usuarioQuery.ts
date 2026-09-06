import type { IUsuarioService } from '../../application/ports/IUsuarioService.js'

export const createUsuarioQuery = (service: IUsuarioService) => ({
  usuarios: async () => service.listar(),

  usuario: async (_: any, { id }: { id: string }) => service.buscarPorId(id),

  // A autenticação é garantida pela diretiva @auth no schema.
  me: async (_: any, __: any, context: any) => service.buscarPorId(context.user.id)
})
