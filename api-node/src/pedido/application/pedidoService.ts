import { GraphQLError } from 'graphql'
import type { IPedidoRepository } from '../domain/IPedidoRepository.js'
import type { UsuarioAppService } from '../../usuario/application/usuarioService.js'
import { Pedido, PedidoInvalidoError } from '../domain/Pedido.js'
import { Coordenada } from '../../shared/domain/value-objects/Coordenada.js'
import { Dinheiro } from '../../shared/domain/value-objects/Dinheiro.js'
import { StatusPedido } from '../domain/StatusPedido.js'

export class PedidoAppService {
  constructor(
    private readonly repository: IPedidoRepository,
    private readonly usuarioService: UsuarioAppService
  ) {}

  async listar(): Promise<Pedido[]> {
    return this.repository.listarPedidos()
  }

  async buscarPorId(id: number | string): Promise<Pedido | null> {
    return this.repository.buscarPedidoPorId(id)
  }

  async buscarPorUsuarioId(id: number | string): Promise<Pedido[]> {
    return this.repository.buscarPedidoPorUsuarioId(id)
  }

  async criar(dados: {
    usuario_id: string | number
    restaurante_id: string | number
    destino_latitude?: number | null
    destino_longitude?: number | null
    valor_total: number
  }): Promise<Pedido> {
    let { destino_latitude, destino_longitude, usuario_id, restaurante_id, valor_total } = dados

    if (destino_latitude == null || destino_longitude == null) {
      const usuario = await this.usuarioService.buscarPorId(usuario_id)
      if (!usuario || usuario.latitude == null || usuario.longitude == null) {
        throw new GraphQLError('Endereço de entrega não definido no perfil do usuário.', { extensions: { code: 'BAD_USER_INPUT' } })
      }
      destino_latitude = usuario.latitude
      destino_longitude = usuario.longitude
    }

    const destino = new Coordenada(Number(destino_latitude), Number(destino_longitude))

    const pedido = new Pedido(
      Number(usuario_id),
      Number(restaurante_id),
      new StatusPedido('EM_PREPARO_ENTREGA'),
      new Dinheiro(Number(valor_total)),
      destino
    )

    return this.repository.criarPedido(pedido)
  }

  async editarPorId(id: number | string, dados: {
    status?: string
    valor_total?: number
    destino_latitude?: number
    destino_longitude?: number
  }): Promise<Pedido> {
    const pedidoAtual = await this.repository.buscarPedidoPorId(id)
    if (!pedidoAtual) {
      throw new PedidoInvalidoError('Pedido não encontrado')
    }

    if (dados.status !== undefined) pedidoAtual.status = dados.status
    if (dados.valor_total !== undefined) pedidoAtual.valor = new Dinheiro(Number(dados.valor_total))
    
    if (dados.destino_latitude !== undefined || dados.destino_longitude !== undefined) {
      const lat = dados.destino_latitude !== undefined ? Number(dados.destino_latitude) : pedidoAtual.destino_latitude
      const lon = dados.destino_longitude !== undefined ? Number(dados.destino_longitude) : pedidoAtual.destino_longitude
      pedidoAtual.destino = new Coordenada(lat, lon)
    }

    return this.repository.editarPedidoPorId(id, pedidoAtual)
  }

  async deletar(id: number | string): Promise<boolean> {
    return this.repository.deletarPedido(id)
  }
}
