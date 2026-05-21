import { Produto } from './Produto.js'

export interface IProdutoRepository {
  listarProdutos(): Promise<Produto[]>
  buscarProdutoPorId(id: number | string): Promise<Produto | null>
  buscarProdutosPorCategoria(categoria_id: number | string): Promise<Produto[]>
  criarProduto(produto: Produto): Promise<Produto>
  editarProdutoPorId(id: number | string, produto: Partial<Produto>): Promise<Produto>
  deletarProduto(id: number | string): Promise<boolean>
}
