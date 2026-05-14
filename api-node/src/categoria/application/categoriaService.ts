import type { ICategoriaRepository } from '../domain/ICategoriaRepository.js'
import { Categoria, CategoriaInvalidaError } from '../domain/Categoria.js'

/**
 * CategoriaAppService — Application Layer
 * 
 * Orquestra o fluxo de negócio para a entidade Categoria.
 * Depende apenas da interface ICategoriaRepository (Domain),
 * nunca da implementação concreta (Infrastructure).
 */
export class CategoriaAppService {
  constructor(private readonly repository: ICategoriaRepository) {}

  async listar(): Promise<Categoria[]> {
    return this.repository.listarCategorias()
  }

  async buscarPorId(id: number | string): Promise<Categoria | null> {
    return this.repository.buscarCategoriaPorId(id)
  }

  async buscarPorRestaurante(restaurante_id: number | string): Promise<Categoria[]> {
    return this.repository.buscarCategoriasPorRestaurante(restaurante_id)
  }

  async criar(dados: { nome: string; restaurante_id: string }): Promise<Categoria> {
    const categoria = new Categoria(dados.nome, undefined, Number(dados.restaurante_id))
    return this.repository.criarCategoria(categoria)
  }

  async editarPorId(id: number | string, dados: { nome?: string; restaurante_id?: number }): Promise<Categoria> {
    const categoriaAtual = await this.repository.buscarCategoriaPorId(id)
    if (!categoriaAtual) {
      throw new CategoriaInvalidaError('Categoria não encontrada')
    }
    if (dados.nome !== undefined) {
      categoriaAtual.nome = dados.nome
    }
    return this.repository.editarCategoriaPorId(id, categoriaAtual)
  }

  async deletar(id: number | string): Promise<boolean> {
    return this.repository.deletarCategoria(id)
  }
}
