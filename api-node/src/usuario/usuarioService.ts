import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { GraphQLError } from 'graphql'
import * as usuarioRepository from './usuarioRepository.js'
import { Usuario, UsuarioInvalidoError } from './domain/Usuario.js'
import { logger } from '../shared/utils/logger.js'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  logger.error('FATAL: A variável de ambiente JWT_SECRET não foi configurada. A aplicação será encerrada.', 'AuthService');
  throw new Error('FATAL: A variável de ambiente JWT_SECRET não foi configurada.')
}

const SALT_ROUNDS = 10

export const listar = async (): Promise<Usuario[]> => {
  return usuarioRepository.listarUsuarios()
}

export const buscarPorId = async (id: number | string): Promise<Usuario | null> => {
  const usuario = await usuarioRepository.buscarUsuarioPorId(id)
  if (!usuario) {
    logger.warn(`Tentativa de busca por usuário inexistente. ID: ${id}`, 'UsuarioService');
  }
  return usuario
}

export const buscarPorEmail = async (email: string): Promise<Usuario | null> => {
  return usuarioRepository.buscarUsuarioPorEmail(email)
}

export const criar = async (dados: {
  nome: string;
  email: string;
  telefone?: string | null;
  senha?: string | null;
}): Promise<Usuario> => {
  let senhaHashed = null;
  if (dados.senha) {
    senhaHashed = await bcrypt.hash(dados.senha, SALT_ROUNDS)
  }
  
  const usuario = new Usuario(
    dados.nome,
    dados.email,
    dados.telefone,
    senhaHashed
  );

  const novoUsuario = await usuarioRepository.criarUsuario(usuario)
  logger.debug(`Novo usuário criado: ${novoUsuario.email} (ID: ${novoUsuario.id})`, 'UsuarioService');
  return novoUsuario
}

export const editarPorId = async (id: number | string, dados: {
  nome?: string;
  email?: string;
  telefone?: string | null;
  senha?: string | null;
}): Promise<Usuario> => {
  const usuarioAtual = await usuarioRepository.buscarUsuarioPorId(id);
  if (!usuarioAtual) {
    throw new UsuarioInvalidoError('Usuário não encontrado');
  }

  if (dados.nome !== undefined) usuarioAtual.nome = dados.nome;
  if (dados.email !== undefined) usuarioAtual.email = dados.email;
  if (dados.telefone !== undefined) usuarioAtual.telefone = dados.telefone;
  
  if (dados.senha !== undefined && dados.senha !== null) {
    usuarioAtual.senha = await bcrypt.hash(dados.senha, SALT_ROUNDS)
  }

  return usuarioRepository.editarUsuarioPorId(id, usuarioAtual)
}

export const deletar = async (id: number | string): Promise<boolean> => {
  return usuarioRepository.deletarUsuario(id)
}

export const login = async (email: string, senha: string): Promise<{ token: string; usuario: Usuario }> => {
  const usuario = await usuarioRepository.buscarUsuarioPorEmail(email)
  if (!usuario) {
    logger.warn(`Tentativa de login com e-mail inexistente: ${email}`, 'AuthService');
    throw new GraphQLError('E-mail ou senha incorretos.', { extensions: { code: 'UNAUTHENTICATED' } })
  }

  if (!usuario.senha) {
    logger.warn(`Falha de senha para o usuário: ${email} (Senha não definida no banco)`, 'AuthService');
    throw new GraphQLError('E-mail ou senha incorretos.', { extensions: { code: 'UNAUTHENTICATED' } })
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha)
  if (!senhaValida) {
    logger.warn(`Falha de senha para o usuário: ${email}`, 'AuthService');
    throw new GraphQLError('E-mail ou senha incorretos.', { extensions: { code: 'UNAUTHENTICATED' } })
  }

  const token = jwt.sign(
    { iss: 'express-delivery-app', id: usuario.id, email: usuario.email, nome: usuario.nome },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  return { token, usuario }
}

export const verificarToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (err: any) {
    logger.warn(`Token inválido ou expirado detectado: ${err.message}`, 'AuthService');
    return null
  }
}

export const atualizarEndereco = async (id: number | string, dados: {
  latitude?: number | null;
  longitude?: number | null;
  endereco?: string | null;
}): Promise<Usuario> => {
  const usuarioAtual = await usuarioRepository.buscarUsuarioPorId(id);
  if (!usuarioAtual) {
    throw new UsuarioInvalidoError('Usuário não encontrado');
  }

  if (dados.latitude !== undefined) usuarioAtual.latitude = dados.latitude !== null ? Number(dados.latitude) : null;
  if (dados.longitude !== undefined) usuarioAtual.longitude = dados.longitude !== null ? Number(dados.longitude) : null;
  if (dados.endereco !== undefined) usuarioAtual.endereco = dados.endereco !== null ? dados.endereco : null;

  return usuarioRepository.atualizarEndereco(id, {
    latitude: usuarioAtual.latitude,
    longitude: usuarioAtual.longitude,
    endereco: usuarioAtual.endereco
  })
}
