import type { IProdutoRepository } from '../domain/IProdutoRepository.js'
import { Produto, ProdutoInvalidoError } from '../domain/Produto.js'

export class ProdutoAppService {
  constructor(private readonly repository: IProdutoRepository) {}

  async listar(): Promise<Produto[]> {
    return this.repository.listarProdutos()
  }

  async buscarPorId(id: number | string): Promise<Produto | null> {
    return this.repository.buscarProdutoPorId(id)
  }

  async buscarPorCategoria(categoria_id: number | string): Promise<Produto[]> {
    return this.repository.buscarProdutosPorCategoria(categoria_id)
  }

  async criar(dados: {
    nome: string
    preco: number
    descricao?: string
    categoria_id?: string
  }): Promise<Produto> {
    const produto = new Produto(
      dados.nome,
      dados.preco,
      undefined,
      dados.descricao,
      dados.categoria_id != null ? Number(dados.categoria_id) : null
    )
    return this.repository.criarProduto(produto)
  }

  async editarPorId(id: number | string, dados: {
    nome?: string
    preco?: number
    descricao?: string
    categoria_id?: string
  }): Promise<Produto> {
    const produtoAtual = await this.repository.buscarProdutoPorId(id)
    if (!produtoAtual) {
      throw new ProdutoInvalidoError('Produto não encontrado')
    }
    if (dados.nome !== undefined) produtoAtual.nome = dados.nome
    if (dados.preco !== undefined) produtoAtual.preco = Number(dados.preco)
    if (dados.descricao !== undefined) produtoAtual.descricao = dados.descricao
    return this.repository.editarProdutoPorId(id, produtoAtual)
  }

  async deletar(id: number | string): Promise<boolean> {
    return this.repository.deletarProduto(id)
  }
}
