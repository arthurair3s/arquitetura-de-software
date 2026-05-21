import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { GraphQLError } from 'graphql'
import type { IUsuarioRepository } from '../domain/IUsuarioRepository.js'
import { Usuario, UsuarioInvalidoError } from '../domain/Usuario.js'
import { logger } from '../../shared/utils/logger.js'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  logger.error('FATAL: A variável de ambiente JWT_SECRET não foi configurada. A aplicação será encerrada.', 'AuthService')
  throw new Error('FATAL: A variável de ambiente JWT_SECRET não foi configurada.')
}

const SALT_ROUNDS = 10

/**
 * verificarToken — função utilitária de autenticação.
 * Exportada de forma independente pois é usada no contexto do Apollo (index.ts)
 * sem precisar de injeção de repositório.
 */
export const verificarToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (err: any) {
    logger.warn(`Token inválido ou expirado detectado: ${err.message}`, 'AuthService')
    return null
  }
}

export class UsuarioAppService {
  constructor(private readonly repository: IUsuarioRepository) {}

  async listar(): Promise<Usuario[]> {
    return this.repository.listarUsuarios()
  }

  async buscarPorId(id: number | string): Promise<Usuario | null> {
    const usuario = await this.repository.buscarUsuarioPorId(id)
    if (!usuario) {
      logger.warn(`Tentativa de busca por usuário inexistente. ID: ${id}`, 'UsuarioService')
    }
    return usuario
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    return this.repository.buscarUsuarioPorEmail(email)
  }

  async criar(dados: {
    nome: string
    email: string
    telefone?: string | null
    senha?: string | null
  }): Promise<Usuario> {
    let senhaHashed = null
    if (dados.senha) {
      senhaHashed = await bcrypt.hash(dados.senha, SALT_ROUNDS)
    }
    const usuario = new Usuario(dados.nome, dados.email, dados.telefone, senhaHashed)
    const novoUsuario = await this.repository.criarUsuario(usuario)
    logger.debug(`Novo usuário criado: ${novoUsuario.email} (ID: ${novoUsuario.id})`, 'UsuarioService')
    return novoUsuario
  }

  async editarPorId(id: number | string, dados: {
    nome?: string
    email?: string
    telefone?: string | null
    senha?: string | null
  }): Promise<Usuario> {
    const usuarioAtual = await this.repository.buscarUsuarioPorId(id)
    if (!usuarioAtual) throw new UsuarioInvalidoError('Usuário não encontrado')
    if (dados.nome !== undefined) usuarioAtual.nome = dados.nome
    if (dados.email !== undefined) usuarioAtual.email = dados.email
    if (dados.telefone !== undefined) usuarioAtual.telefone = dados.telefone
    if (dados.senha !== undefined && dados.senha !== null) {
      usuarioAtual.senha = await bcrypt.hash(dados.senha, SALT_ROUNDS)
    }
    return this.repository.editarUsuarioPorId(id, usuarioAtual)
  }

  async deletar(id: number | string): Promise<boolean> {
    return this.repository.deletarUsuario(id)
  }

  async login(email: string, senha: string): Promise<{ token: string; usuario: Usuario }> {
    const usuario = await this.repository.buscarUsuarioPorEmail(email)
    if (!usuario) {
      logger.warn(`Tentativa de login com e-mail inexistente: ${email}`, 'AuthService')
      throw new GraphQLError('E-mail ou senha incorretos.', { extensions: { code: 'UNAUTHENTICATED' } })
    }
    if (!usuario.senha) {
      logger.warn(`Falha de senha para o usuário: ${email} (Senha não definida no banco)`, 'AuthService')
      throw new GraphQLError('E-mail ou senha incorretos.', { extensions: { code: 'UNAUTHENTICATED' } })
    }
    const senhaValida = await bcrypt.compare(senha, usuario.senha)
    if (!senhaValida) {
      logger.warn(`Falha de senha para o usuário: ${email}`, 'AuthService')
      throw new GraphQLError('E-mail ou senha incorretos.', { extensions: { code: 'UNAUTHENTICATED' } })
    }
    const token = jwt.sign(
      { iss: 'express-delivery-app', id: usuario.id, email: usuario.email, nome: usuario.nome },
      JWT_SECRET as string,
      { expiresIn: '7d' }
    )
    return { token, usuario }
  }

  async atualizarEndereco(id: number | string, dados: {
    latitude?: number | null
    longitude?: number | null
    endereco?: string | null
  }): Promise<Usuario> {
    const usuarioAtual = await this.repository.buscarUsuarioPorId(id)
    if (!usuarioAtual) throw new UsuarioInvalidoError('Usuário não encontrado')
    if (dados.latitude !== undefined) usuarioAtual.latitude = dados.latitude !== null ? Number(dados.latitude) : null
    if (dados.longitude !== undefined) usuarioAtual.longitude = dados.longitude !== null ? Number(dados.longitude) : null
    if (dados.endereco !== undefined) usuarioAtual.endereco = dados.endereco !== null ? dados.endereco : null
    return this.repository.atualizarEndereco(id, {
      latitude: usuarioAtual.latitude,
      longitude: usuarioAtual.longitude,
      endereco: usuarioAtual.endereco
    })
  }
}
