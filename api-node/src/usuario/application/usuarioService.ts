import jwt from 'jsonwebtoken'
import { GraphQLError } from 'graphql'
import type { IUsuarioRepository } from '../domain/IUsuarioRepository.js'
import { Usuario, UsuarioInvalidoError } from '../domain/Usuario.js'
import { logger } from '../../shared/utils/logger.js'
import { Email } from '../../shared/domain/value-objects/Email.js'
import { SenhaHash } from '../../shared/domain/value-objects/SenhaHash.js'
import { Coordenada } from '../../shared/domain/value-objects/Coordenada.js'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  logger.error('FATAL: A variável de ambiente JWT_SECRET não foi configurada. A aplicação será encerrada.', 'AuthService')
  throw new Error('FATAL: A variável de ambiente JWT_SECRET não foi configurada.')
}

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
    let senhaHashed: SenhaHash | null = null
    if (dados.senha) {
      senhaHashed = await SenhaHash.deSenhaPlana(dados.senha)
    }

    const usuario = new Usuario(
      dados.nome,
      new Email(dados.email),
      dados.telefone,
      senhaHashed
    )

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
    if (dados.email !== undefined) usuarioAtual.emailObj = new Email(dados.email)
    if (dados.telefone !== undefined) usuarioAtual.telefone = dados.telefone
    if (dados.senha !== undefined && dados.senha !== null) {
      usuarioAtual.senhaObj = await SenhaHash.deSenhaPlana(dados.senha)
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

    if (!usuario.senhaObj) {
      logger.warn(`Falha de senha para o usuário: ${email} (Senha não definida no banco)`, 'AuthService')
      throw new GraphQLError('E-mail ou senha incorretos.', { extensions: { code: 'UNAUTHENTICATED' } })
    }

    const senhaValida = await usuario.senhaObj.comparar(senha)
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

    if (dados.latitude !== undefined || dados.longitude !== undefined) {
      const novaLat = dados.latitude !== undefined ? (dados.latitude !== null ? Number(dados.latitude) : null) : null
      const novaLon = dados.longitude !== undefined ? (dados.longitude !== null ? Number(dados.longitude) : null) : null
      
      const latFinal = novaLat !== null ? novaLat : usuarioAtual.latitude
      const lonFinal = novaLon !== null ? novaLon : usuarioAtual.longitude

      usuarioAtual.coordenada = (latFinal !== null && lonFinal !== null) 
        ? new Coordenada(latFinal, lonFinal) 
        : null
    }

    if (dados.endereco !== undefined) usuarioAtual.endereco = dados.endereco !== null ? dados.endereco : null

    return this.repository.atualizarEndereco(id, {
      latitude: usuarioAtual.latitude,
      longitude: usuarioAtual.longitude,
      endereco: usuarioAtual.endereco
    })
  }
}
