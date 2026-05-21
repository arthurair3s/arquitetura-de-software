import { Usuario } from '../Usuario.js'

export interface IUsuarioRepository {
  listarUsuarios(): Promise<Usuario[]>
  buscarUsuarioPorId(id: number | string): Promise<Usuario | null>
  buscarUsuarioPorEmail(email: string): Promise<Usuario | null>
  criarUsuario(usuario: Usuario): Promise<Usuario>
  editarUsuarioPorId(id: number | string, usuario: Partial<Usuario>): Promise<Usuario>
  deletarUsuario(id: number | string): Promise<boolean>
  atualizarEndereco(id: number | string, dados: {
    latitude?: number | null
    longitude?: number | null
    endereco?: string | null
  }): Promise<Usuario>
}
