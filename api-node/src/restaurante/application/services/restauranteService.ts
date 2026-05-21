import type { IRestauranteRepository } from '../../domain/ports/IRestauranteRepository.js'
import type { IRestauranteService } from '../ports/IRestauranteService.js'
import { Restaurante, RestauranteInvalidoError } from '../../domain/Restaurante.js'
import { Coordenada } from '../../../shared/domain/value-objects/Coordenada.js'

export class RestauranteAppService implements IRestauranteService {
  constructor(private readonly repository: IRestauranteRepository) {}

  async listar(): Promise<Restaurante[]> {
    return this.repository.listarRestaurantes()
  }

  async buscarPorId(id: number | string): Promise<Restaurante | null> {
    return this.repository.buscarRestaurantePorId(id)
  }

  async criar(dados: {
    nome: string
    descricao?: string | null
    endereco?: string | null
    latitude?: number | null
    longitude?: number | null
  }): Promise<Restaurante> {
    const coordenada = (dados.latitude != null && dados.longitude != null)
      ? new Coordenada(dados.latitude, dados.longitude)
      : null;

    const restaurante = new Restaurante(
      dados.nome,
      dados.descricao,
      dados.endereco,
      coordenada
    )
    return this.repository.criarRestaurante(restaurante)
  }

  async editarPorId(id: number | string, dados: {
    nome?: string
    descricao?: string | null
    endereco?: string | null
  }): Promise<Restaurante> {
    const restauranteAtual = await this.repository.buscarRestaurantePorId(id)
    if (!restauranteAtual) {
      throw new RestauranteInvalidoError('Restaurante não encontrado')
    }
    if (dados.nome !== undefined) restauranteAtual.nome = dados.nome
    if (dados.descricao !== undefined) restauranteAtual.descricao = dados.descricao
    if (dados.endereco !== undefined) restauranteAtual.endereco = dados.endereco
    return this.repository.editarRestaurantePorId(id, restauranteAtual)
  }

  async deletar(id: number | string): Promise<boolean> {
    return this.repository.deletarRestaurante(id)
  }
}
