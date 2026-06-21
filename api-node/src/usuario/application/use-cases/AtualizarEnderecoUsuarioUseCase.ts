import type { IUsuarioRepository } from '../../domain/ports/IUsuarioRepository.js'
import { Usuario, UsuarioInvalidoError } from '../../domain/Usuario.js'
import { Coordenada } from '../../../shared/domain/value-objects/Coordenada.js'

export interface AtualizarEnderecoUsuarioInput {
  usuario_id: number | string
  latitude?: number | null
  longitude?: number | null
  endereco?: string | null
}

export class AtualizarEnderecoUsuarioUseCase {
  constructor(private readonly repository: IUsuarioRepository) {}

  async execute(dados: AtualizarEnderecoUsuarioInput): Promise<Usuario> {
    const usuarioAtual = await this.repository.buscarUsuarioPorId(dados.usuario_id)
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

    return this.repository.atualizarEndereco(dados.usuario_id, {
      latitude: usuarioAtual.coordenada?.latitude ?? null,
      longitude: usuarioAtual.coordenada?.longitude ?? null,
      endereco: usuarioAtual.endereco
    })
  }
}
