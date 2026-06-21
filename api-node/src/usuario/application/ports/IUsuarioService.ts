import { Usuario } from '../../domain/Usuario.js'

export interface IUsuarioService {
  listar(): Promise<Usuario[]>
  buscarPorId(id: number | string): Promise<Usuario | null>
  buscarPorEmail(email: string): Promise<Usuario | null>
  criar(dados: {
    nome: string
    email: string
    telefone?: string | null
    senha?: string | null
  }): Promise<Usuario>
  editarPorId(id: number | string, dados: {
    nome?: string
    email?: string
    telefone?: string | null
    senha?: string | null
  }): Promise<Usuario>
  deletar(id: number | string): Promise<boolean>
}
