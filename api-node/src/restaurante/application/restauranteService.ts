import type { IRestauranteRepository } from '../domain/IRestauranteRepository.js'
import { Restaurante, RestauranteInvalidoError } from '../domain/Restaurante.js'

export class RestauranteAppService {
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
    const restaurante = new Restaurante(
      dados.nome,
      dados.descricao,
      dados.endereco,
      dados.latitude,
      dados.longitude
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
