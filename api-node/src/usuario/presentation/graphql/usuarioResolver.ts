import { diContainer } from '../../../shared/infrastructure/container.js'
import { createUsuarioQuery } from './usuarioQuery.js'
import { createUsuarioMutation } from './usuarioMutation.js'

const service = diContainer.getUsuarioService()
const loginUsuarioUseCase = diContainer.getLoginUsuarioUseCase()
const atualizarEnderecoUsuarioUseCase = diContainer.getAtualizarEnderecoUsuarioUseCase()

export const usuarioResolver = {
  Query: createUsuarioQuery(service),
  Mutation: createUsuarioMutation(service, loginUsuarioUseCase, atualizarEnderecoUsuarioUseCase)
}
