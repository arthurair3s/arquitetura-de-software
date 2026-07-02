import { Restaurante } from '../../domain/Restaurante.js'

export interface IRestauranteService {
  listar(): Promise<Restaurante[]>
  buscarPorId(id: number | string): Promise<Restaurante | null>
  criar(dados: {
    nome: string
    descricao?: string | null
    endereco?: string | null
    latitude?: number | null
    longitude?: number | null
  }): Promise<Restaurante>
  editarPorId(id: number | string, dados: {
    nome?: string
    descricao?: string | null
    endereco?: string | null
    latitude?: number | null
    longitude?: number | null
  }): Promise<Restaurante>
  deletar(id: number | string): Promise<boolean>
}
