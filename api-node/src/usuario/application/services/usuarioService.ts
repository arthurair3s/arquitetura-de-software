import type { IUsuarioRepository } from '../../domain/ports/IUsuarioRepository.js'
import type { IUsuarioService } from '../ports/IUsuarioService.js'
import { Usuario, UsuarioInvalidoError } from '../../domain/Usuario.js'
import { logger } from '../../../shared/utils/logger.js'
import { Email } from '../../../shared/domain/value-objects/Email.js'
import { SenhaHash } from '../../../shared/domain/value-objects/SenhaHash.js'
import { Coordenada } from '../../../shared/domain/value-objects/Coordenada.js'
import type { ITokenService } from '../../../shared/domain/ITokenService.js'

export class UsuarioAppService implements IUsuarioService {
  constructor(
    private readonly repository: IUsuarioRepository,
    private readonly tokenService: ITokenService
  ) {}

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
    logger.debug(`Novo usuário criado: ${novoUsuario.emailObj.valor} (ID: ${novoUsuario.id})`, 'UsuarioService')
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

    const novoNome = dados.nome !== undefined ? dados.nome : usuarioAtual.nome
    const novoEmail = dados.email !== undefined ? new Email(dados.email) : usuarioAtual.emailObj
    const novoTelefone = dados.telefone !== undefined ? dados.telefone : usuarioAtual.telefone

    usuarioAtual.atualizarPerfil(novoNome, novoEmail, novoTelefone)

    if (dados.senha !== undefined && dados.senha !== null) {
      usuarioAtual.alterarSenha(await SenhaHash.deSenhaPlana(dados.senha))
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
      throw new UsuarioInvalidoError('E-mail ou senha incorretos.')
    }

    if (!usuario.senhaObj) {
      logger.warn(`Falha de senha para o usuário: ${email} (Senha não definida no banco)`, 'AuthService')
      throw new UsuarioInvalidoError('E-mail ou senha incorretos.')
    }

    const senhaValida = await usuario.senhaObj.comparar(senha)
    if (!senhaValida) {
      logger.warn(`Falha de senha para o usuário: ${email}`, 'AuthService')
      throw new UsuarioInvalidoError('E-mail ou senha incorretos.')
    }

    const token = this.tokenService.gerarToken(
      { iss: 'express-delivery-app', id: usuario.id, email: usuario.emailObj.valor, nome: usuario.nome },
      '7d'
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

    let novaCoordenada = usuarioAtual.coordenada
    if (dados.latitude !== undefined || dados.longitude !== undefined) {
      const novaLat = dados.latitude !== undefined ? (dados.latitude !== null ? Number(dados.latitude) : null) : (usuarioAtual.coordenada?.latitude ?? null)
      const novaLon = dados.longitude !== undefined ? (dados.longitude !== null ? Number(dados.longitude) : null) : (usuarioAtual.coordenada?.longitude ?? null)
      
      novaCoordenada = (novaLat !== null && novaLon !== null) 
        ? new Coordenada(novaLat, novaLon) 
        : null
    }

    const novoEndereco = dados.endereco !== undefined ? (dados.endereco !== null ? dados.endereco : null) : usuarioAtual.endereco

    usuarioAtual.atualizarEndereco(novaCoordenada, novoEndereco)

    return this.repository.atualizarEndereco(id, {
      latitude: usuarioAtual.coordenada?.latitude ?? null,
      longitude: usuarioAtual.coordenada?.longitude ?? null,
      endereco: usuarioAtual.endereco
    })
  }
}
