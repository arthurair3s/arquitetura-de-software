import { diContainer } from '../../../shared/infrastructure/container.js'
import { createAvaliacaoQuery } from './avaliacaoQuery.js'
import { createAvaliacaoMutation } from './avaliacaoMutation.js'
import { Avaliacao } from '../../domain/Avaliacao.js'

const service = diContainer.getAvaliacaoService()
const usuarioService = diContainer.getUsuarioService()
const restauranteService = diContainer.getRestauranteService()

export const avaliacaoResolver = {
  Query: createAvaliacaoQuery(service),
  Mutation: createAvaliacaoMutation(service),
  Avaliacao: {
    usuario: async (parent: Avaliacao) => {
      if (!parent.usuario_id) return null
      return usuarioService.buscarPorId(parent.usuario_id)
    },
    restaurante: async (parent: Avaliacao) => {
      if (!parent.restaurante_id) return null
      return restauranteService.buscarPorId(parent.restaurante_id)
    }
  }
}
