import { Restaurante } from '../../domain/Restaurante.js'
import type { IRestauranteRepository } from '../../domain/ports/IRestauranteRepository.js'
import { CacheAside } from '../../../shared/infrastructure/cache/cacheAside.js'

const CHAVE_LISTA = 'cache:restaurantes:all'
const chaveItem = (id: number | string) => `cache:restaurante:${id}`

const TTL_LISTA_SEGUNDOS = 300
const TTL_ITEM_SEGUNDOS = 180

interface RestauranteBruto {
  id?: number
  nome: string
  descricao: string | null
  endereco: string | null
  latitude: number | null
  longitude: number | null
}

const serializar = (r: Restaurante): RestauranteBruto => ({
  id: r.id,
  nome: r.nome,
  descricao: r.descricao,
  endereco: r.endereco,
  latitude: r.latitude,
  longitude: r.longitude
})

/**
 * Decorator de cache sobre o repositório de restaurantes.
 *
 * Implementa a mesma porta do repositório real, então quem depende de
 * IRestauranteRepository não percebe a diferença — a troca acontece só na
 * composição, dentro do container de DI.
 *
 * As escritas invalidam as chaves afetadas aqui mesmo, e não no resolver:
 * qualquer caminho que persista um restaurante passa por este ponto.
 */
export class CachedRestauranteRepository implements IRestauranteRepository {
  constructor(
    private readonly origem: IRestauranteRepository,
    private readonly cache: CacheAside = new CacheAside('RestauranteCache')
  ) {}

  async listarRestaurantes(): Promise<Restaurante[]> {
    return this.cache.lerOuCarregar(
      CHAVE_LISTA,
      TTL_LISTA_SEGUNDOS,
      () => this.origem.listarRestaurantes(),
      (lista) => lista.map(serializar),
      (bruto) => bruto.map((r) => Restaurante.criar(r))
    )
  }

  async buscarRestaurantePorId(id: number | string): Promise<Restaurante | null> {
    return this.cache.lerOuCarregar(
      chaveItem(id),
      TTL_ITEM_SEGUNDOS,
      () => this.origem.buscarRestaurantePorId(id),
      (r) => (r === null ? null : serializar(r)),
      (bruto) => (bruto === null ? null : Restaurante.criar(bruto))
    )
  }

  async criarRestaurante(restaurante: Restaurante): Promise<Restaurante> {
    const criado = await this.origem.criarRestaurante(restaurante)
    await this.cache.invalidar(CHAVE_LISTA)
    return criado
  }

  async editarRestaurantePorId(id: number | string, restaurante: Partial<Restaurante>): Promise<Restaurante> {
    const atualizado = await this.origem.editarRestaurantePorId(id, restaurante)
    await this.cache.invalidar(CHAVE_LISTA, chaveItem(id))
    return atualizado
  }

  async deletarRestaurante(id: number | string): Promise<boolean> {
    const removido = await this.origem.deletarRestaurante(id)
    await this.cache.invalidar(CHAVE_LISTA, chaveItem(id))
    return removido
  }
}
