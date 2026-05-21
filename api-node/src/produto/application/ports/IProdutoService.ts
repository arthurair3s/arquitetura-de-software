import { Produto } from '../../domain/Produto.js'

export interface IProdutoService {
  listar(): Promise<Produto[]>
  buscarPorId(id: number | string): Promise<Produto | null>
  buscarPorCategoria(categoria_id: number | string): Promise<Produto[]>
  criar(dados: {
    nome: string
    preco: number
    descricao?: string
    categoria_id?: string
  }): Promise<Produto>
  editarPorId(id: number | string, dados: {
    nome?: string
    preco?: number
    descricao?: string
    categoria_id?: string
  }): Promise<Produto>
  deletar(id: number | string): Promise<boolean>
}
