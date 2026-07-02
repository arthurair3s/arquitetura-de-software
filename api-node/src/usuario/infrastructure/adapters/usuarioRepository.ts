import { prisma } from '../../../infra/database/connection.js'
import { Usuario } from '../../domain/Usuario.js'
import type { IUsuarioRepository } from '../../domain/ports/IUsuarioRepository.js'

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
        email: usuario.emailObj.valor,
        telefone: usuario.telefone,
        senha: usuario.senhaObj?.valor ?? null,
        latitude: usuario.coordenada?.latitude != null ? Number(usuario.coordenada.latitude) : undefined,
        longitude: usuario.coordenada?.longitude != null ? Number(usuario.coordenada.longitude) : undefined,
        endereco: usuario.endereco,
        role: usuario.role,
        entregador_id: usuario.entregador_id != null ? Number(usuario.entregador_id) : null,
        restaurante_id: usuario.restaurante_id != null ? Number(usuario.restaurante_id) : null
      }
    })
    return Usuario.criar(novoUsuario)
  }

  async editarUsuarioPorId(id: number | string, usuario: Partial<Usuario>): Promise<Usuario> {
    const usuarioAtualizado = await prisma.usuarios.update({
      where: { id: Number(id) },
      data: {
        nome: usuario.nome,
        email: usuario.emailObj?.valor,
        telefone: usuario.telefone,
        senha: usuario.senhaObj?.valor ?? null,
        latitude: usuario.coordenada !== undefined ? (usuario.coordenada?.latitude != null ? Number(usuario.coordenada.latitude) : null) : undefined,
        longitude: usuario.coordenada !== undefined ? (usuario.coordenada?.longitude != null ? Number(usuario.coordenada.longitude) : null) : undefined,
        endereco: usuario.endereco,
        role: usuario.role,
        entregador_id: usuario.entregador_id !== undefined ? (usuario.entregador_id != null ? Number(usuario.entregador_id) : null) : undefined,
        restaurante_id: usuario.restaurante_id !== undefined ? (usuario.restaurante_id != null ? Number(usuario.restaurante_id) : null) : undefined
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
    const idNum = Number(id)
    const lat = dados.latitude != null ? Number(dados.latitude) : null
    const lon = dados.longitude != null ? Number(dados.longitude) : null
    
    console.log(`[UsuarioRepository] Atualizando ID ${idNum}: Lat=${lat}, Lon=${lon}, End=${dados.endereco}`)
    
    const usuarioAtualizado = await prisma.usuarios.update({
      where: { id: idNum },
      data: {
        latitude: lat,
        longitude: lon,
        endereco: dados.endereco
      }
    })
    return Usuario.criar(usuarioAtualizado)
  }
}
