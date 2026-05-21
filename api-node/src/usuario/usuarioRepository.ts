import { prisma } from '../infra/database/connection.js'
import { Usuario } from './domain/Usuario.js'

export const listarUsuarios = async (): Promise<Usuario[]> => {
  const usuarios = await prisma.usuarios.findMany()
  return usuarios.map((u) => Usuario.criar(u))
}

export const buscarUsuarioPorId = async (id: number | string): Promise<Usuario | null> => {
  const usuario = await prisma.usuarios.findUnique({
    where: { id: Number(id) }
  })
  if (!usuario) return null
  return Usuario.criar(usuario)
}

export const buscarUsuarioPorEmail = async (email: string): Promise<Usuario | null> => {
  const usuario = await prisma.usuarios.findUnique({
    where: { email }
  })
  if (!usuario) return null
  return Usuario.criar(usuario)
}

export const criarUsuario = async (usuario: Usuario): Promise<Usuario> => {
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

export const editarUsuarioPorId = async (id: number | string, usuario: Partial<Usuario>): Promise<Usuario> => {
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

export const deletarUsuario = async (id: number | string): Promise<boolean> => {
  await prisma.usuarios.delete({
    where: { id: Number(id) }
  })
  return true
}

export const atualizarEndereco = async (id: number | string, dados: { latitude?: number | null; longitude?: number | null; endereco?: string | null }): Promise<Usuario> => {
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
