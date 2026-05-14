import { UsuarioRepository } from '../infrastructure/usuarioRepository.js'
import { UsuarioAppService } from '../application/usuarioService.js'
import { createUsuarioQuery } from './usuarioQuery.js'
import { createUsuarioMutation } from './usuarioMutation.js'

// inicialização das dependências do módulo
const repository = new UsuarioRepository()
const service = new UsuarioAppService(repository)

export const usuarioResolver = {
  Query: createUsuarioQuery(service),
  Mutation: createUsuarioMutation(service)
}
