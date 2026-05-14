import { AvaliacaoRepository } from '../infrastructure/avaliacaoRepository.js'
import { AvaliacaoAppService } from '../application/avaliacaoService.js'
import { createAvaliacaoQuery } from './avaliacaoQuery.js'
import { createAvaliacaoMutation } from './avaliacaoMutation.js'
import * as usuarioService from '../../usuario/usuarioService.js'
import * as restauranteService from '../../restaurante/restauranteService.js'
import { Avaliacao } from '../domain/Avaliacao.js'

// inicialização das dependências do módulo
const repository = new AvaliacaoRepository()
const service = new AvaliacaoAppService(repository)

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
