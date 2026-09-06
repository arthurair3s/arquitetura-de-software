import { Avaliacao } from '../../domain/Avaliacao.js'
import type { IAvaliacaoRepository } from '../../domain/ports/IAvaliacaoRepository.js'
import { CacheAside } from '../../../shared/infrastructure/cache/cacheAside.js'

const CHAVE_LISTA = 'cache:avaliacoes:all'
const chaveItem = (id: number | string) => `cache:avaliacao:${id}`

const TTL_SEGUNDOS = 600

interface AvaliacaoBruta {
  id?: number
  nota: number
  usuario_id: number | null
  restaurante_id: number | null
  comentario: string | null
}

const serializar = (a: Avaliacao): AvaliacaoBruta => ({
  id: a.id,
  nota: a.nota,
  usuario_id: a.usuario_id,
  restaurante_id: a.restaurante_id,
  comentario: a.comentario
})

/** Decorator de cache sobre o repositório de avaliações. Ver CachedRestauranteRepository. */
export class CachedAvaliacaoRepository implements IAvaliacaoRepository {
  constructor(
    private readonly origem: IAvaliacaoRepository,
    private readonly cache: CacheAside = new CacheAside('AvaliacaoCache')
  ) {}

  async listarAvaliacoes(): Promise<Avaliacao[]> {
    return this.cache.lerOuCarregar(
      CHAVE_LISTA,
      TTL_SEGUNDOS,
      () => this.origem.listarAvaliacoes(),
      (lista) => lista.map(serializar),
      (bruto) => bruto.map((a) => Avaliacao.criar(a))
    )
  }

  async buscarAvaliacaoPorId(id: number | string): Promise<Avaliacao | null> {
    return this.cache.lerOuCarregar(
      chaveItem(id),
      TTL_SEGUNDOS,
      () => this.origem.buscarAvaliacaoPorId(id),
      (a) => (a === null ? null : serializar(a)),
      (bruto) => (bruto === null ? null : Avaliacao.criar(bruto))
    )
  }

  async criarAvaliacao(avaliacao: Avaliacao): Promise<Avaliacao> {
    const criada = await this.origem.criarAvaliacao(avaliacao)
    await this.cache.invalidar(CHAVE_LISTA)
    return criada
  }

  async editarAvaliacaoPorId(id: number | string, avaliacao: Partial<Avaliacao>): Promise<Avaliacao> {
    const atualizada = await this.origem.editarAvaliacaoPorId(id, avaliacao)
    await this.cache.invalidar(CHAVE_LISTA, chaveItem(id))
    return atualizada
  }

  async deletarAvaliacao(id: number | string): Promise<boolean> {
    const removida = await this.origem.deletarAvaliacao(id)
    await this.cache.invalidar(CHAVE_LISTA, chaveItem(id))
    return removida
  }
}
