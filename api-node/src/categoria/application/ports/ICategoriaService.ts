import { Categoria } from '../../domain/Categoria.js'

export interface ICategoriaService {
  listar(): Promise<Categoria[]>
  buscarPorId(id: number | string): Promise<Categoria | null>
  buscarPorRestaurante(restaurante_id: number | string): Promise<Categoria[]>
  criar(dados: { nome: string; restaurante_id: string }): Promise<Categoria>
  editarPorId(id: number | string, dados: { nome?: string; restaurante_id?: number }): Promise<Categoria>
  deletar(id: number | string): Promise<boolean>
}
