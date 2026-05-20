import { UsuarioRepository } from '../infrastructure/usuarioRepository.js'
import { UsuarioAppService } from '../application/usuarioService.js'
import { createUsuarioQuery } from './usuarioQuery.js'
import { createUsuarioMutation } from './usuarioMutation.js'
import { JwtTokenService } from '../../shared/infrastructure/JwtTokenService.js'

// inicialização das dependências do módulo
const repository = new UsuarioRepository()
const tokenService = new JwtTokenService()
const service = new UsuarioAppService(repository, tokenService)

export const usuarioResolver = {
  Query: createUsuarioQuery(service),
  Mutation: createUsuarioMutation(service)
}
