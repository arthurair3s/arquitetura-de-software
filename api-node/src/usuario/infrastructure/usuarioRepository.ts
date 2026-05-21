import { prisma } from '../../infra/database/connection.js'
import { Usuario } from '../domain/Usuario.js'
import type { IUsuarioRepository } from '../domain/IUsuarioRepository.js'

export class UsuarioRepository implements IUsuarioRepository {
  async listarUsuarios(): Promise<Usuario[]> {
    const usuarios = await prisma.usuarios.findMany()
    return usuarios.map((u) => Usuario.criar(u))
  }

  async buscarUsuarioPorId(id: number | string): Promise<Usuario | null> {
    const usuario = await prisma.usuarios.findUnique({
      where: { id: Number(id) }
    })
    if (!usuario) return null
    return Usuario.criar(usuario)
  }

  async buscarUsuarioPorEmail(email: string): Promise<Usuario | null> {
    const usuario = await prisma.usuarios.findUnique({
      where: { email }
    })
    if (!usuario) return null
    return Usuario.criar(usuario)
  }

  async criarUsuario(usuario: Usuario): Promise<Usuario> {
    const novoUsuario = await prisma.usuarios.create({
      data: {
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        senha: usuario.senha,
        latitude: usuario.latitude != null ? Number(usuario.latitude) : undefined,
        longitude: usuario.longitude != null ? Number(usuario.longitude) : undefined,
        endereco: usuario.endereco
      }
    })
    return Usuario.criar(novoUsuario)
  }

  async editarUsuarioPorId(id: number | string, usuario: Partial<Usuario>): Promise<Usuario> {
    const usuarioAtualizado = await prisma.usuarios.update({
      where: { id: Number(id) },
      data: {
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        senha: usuario.senha,
        latitude: usuario.latitude !== undefined ? (usuario.latitude != null ? Number(usuario.latitude) : null) : undefined,
        longitude: usuario.longitude !== undefined ? (usuario.longitude != null ? Number(usuario.longitude) : null) : undefined,
        endereco: usuario.endereco
      }
    })
    return Usuario.criar(usuarioAtualizado)
  }

  async deletarUsuario(id: number | string): Promise<boolean> {
    await prisma.usuarios.delete({
      where: { id: Number(id) }
    })
    return true
  }

  async atualizarEndereco(id: number | string, dados: {
    latitude?: number | null
    longitude?: number | null
    endereco?: string | null
  }): Promise<Usuario> {
    const usuarioAtualizado = await prisma.usuarios.update({
      where: { id: Number(id) },
      data: {
        latitude: dados.latitude != null ? Number(dados.latitude) : null,
        longitude: dados.longitude != null ? Number(dados.longitude) : null,
        endereco: dados.endereco
      }
    })
    return Usuario.criar(usuarioAtualizado)
  }
}
