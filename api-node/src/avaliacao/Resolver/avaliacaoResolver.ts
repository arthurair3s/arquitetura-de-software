import { AvaliacaoRepository } from '../infrastructure/avaliacaoRepository.js'
import { AvaliacaoAppService } from '../application/avaliacaoService.js'
import { createAvaliacaoQuery } from './avaliacaoQuery.js'
import { createAvaliacaoMutation } from './avaliacaoMutation.js'
import { UsuarioAppService } from '../../usuario/application/services/usuarioService.js'
import { UsuarioRepository } from '../../usuario/infrastructure/adapters/usuarioRepository.js'
import { RestauranteAppService } from '../../restaurante/application/restauranteService.js'
import { RestauranteRepository } from '../../restaurante/infrastructure/restauranteRepository.js'
import { Avaliacao } from '../domain/Avaliacao.js'
import { JwtTokenService } from '../../shared/infrastructure/JwtTokenService.js'

const usuarioService = new UsuarioAppService(new UsuarioRepository(), new JwtTokenService())
const restauranteService = new RestauranteAppService(new RestauranteRepository())

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
