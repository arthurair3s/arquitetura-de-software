import type { IUsuarioRepository } from '../../domain/ports/IUsuarioRepository.js'
import type { ITokenService } from '../../../shared/domain/ITokenService.js'
import { Usuario, UsuarioInvalidoError } from '../../domain/Usuario.js'
import { logger } from '../../../shared/utils/logger.js'
import entregadorClient from '../../../grpc/entregadorClient.js'

export interface LoginUsuarioInput {
  email: string
  senha: string
}

export interface LoginUsuarioOutput {
  token: string
  usuario: Usuario
}

export class LoginUsuarioUseCase {
  constructor(
    private readonly repository: IUsuarioRepository,
    private readonly tokenService: ITokenService
  ) {}

  async execute(dados: LoginUsuarioInput): Promise<LoginUsuarioOutput> {
    const usuario = await this.repository.buscarUsuarioPorEmail(dados.email)
    if (!usuario) {
      logger.warn(`Tentativa de login com e-mail inexistente: ${dados.email}`, 'AuthService')
      throw new UsuarioInvalidoError('E-mail ou senha incorretos.')
    }

    if (!usuario.senhaObj) {
      logger.warn(`Falha de senha para o usuário: ${dados.email} (Senha não definida no banco)`, 'AuthService')
      throw new UsuarioInvalidoError('E-mail ou senha incorretos.')
    }

    const senhaValida = await usuario.senhaObj.comparar(dados.senha)
    if (!senhaValida) {
      logger.warn(`Falha de senha para o usuário: ${dados.email}`, 'AuthService')
      throw new UsuarioInvalidoError('E-mail ou senha incorretos.')
    }

    // Registro dinâmico do Entregador no C# via gRPC, se necessário
    if (usuario.role === 'ENTREGADOR' && !usuario.entregador_id) {
      try {
        const entregadorId = await new Promise<number>((resolve, reject) => {
          entregadorClient.CadastrarEntregador(
            {
              nome: usuario.nome,
              telefone: usuario.telefone || '11999999999',
              veiculo: 'Moto'
            },
            (error, response) => {
              if (error) return reject(error)
              resolve(Number(response.id))
            }
          )
        })
        
        usuario.entregador_id = entregadorId
        await this.repository.editarUsuarioPorId(usuario.id!, usuario)
        logger.info(`Entregador ${usuario.nome} cadastrado dinamicamente no gRPC C# com ID: ${entregadorId}`, 'AuthService')
      } catch (err: any) {
        logger.error(`Falha ao cadastrar entregador dinamicamente no gRPC: ${err.message}`, 'AuthService')
      }
    }

    const token = this.tokenService.gerarToken(
      { 
        iss: 'express-delivery-app', 
        id: usuario.id, 
        email: usuario.emailObj.valor, 
        nome: usuario.nome,
        role: usuario.role,
        entregador_id: usuario.entregador_id,
        restaurante_id: usuario.restaurante_id
      },
      '7d'
    )
    return { token, usuario }
  }
}
