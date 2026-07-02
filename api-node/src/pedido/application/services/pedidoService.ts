import type { IPedidoRepository } from '../../domain/ports/IPedidoRepository.js'
import type { IPedidoService } from '../ports/IPedidoService.js'
import type { IUsuarioService } from '../../../usuario/application/ports/IUsuarioService.js'
import { Pedido, PedidoInvalidoError } from '../../domain/Pedido.js'
import { Coordenada } from '../../../shared/domain/value-objects/Coordenada.js'
import { Dinheiro } from '../../../shared/domain/value-objects/Dinheiro.js'
import { StatusPedido } from '../../domain/StatusPedido.js'
import type { IEntregaRepository } from '../../../entrega/domain/ports/IEntregaRepository.js'
import { Entrega } from '../../../entrega/domain/Entrega.js'

import { rabbitMQPublisher } from '../../../shared/infrastructure/messaging/rabbitmqPublisher.js'

export class PedidoAppService implements IPedidoService {
  constructor(
    private readonly repository: IPedidoRepository,
    private readonly usuarioService: IUsuarioService,
    private readonly entregaRepository: IEntregaRepository
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

  async buscarPorRestauranteId(id: number | string): Promise<Pedido[]> {
    return this.repository.buscarPedidoPorRestauranteId(id)
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
      if (!usuario || usuario.coordenada?.latitude == null || usuario.coordenada?.longitude == null) {
        throw new PedidoInvalidoError('Endereço de entrega não definido no perfil do usuário.')
      }
      destino_latitude = usuario.coordenada.latitude
      destino_longitude = usuario.coordenada.longitude
    }

    const destino = new Coordenada(Number(destino_latitude), Number(destino_longitude))

    const pedido = new Pedido(
      Number(usuario_id),
      Number(restaurante_id),
      new StatusPedido('PENDENTE'),
      new Dinheiro(Number(valor_total)),
      destino
    )

    const result = await this.repository.criarPedido(pedido)
    return result
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

    const statusAnterior = pedidoAtual.status;

    if (dados.status !== undefined) pedidoAtual.alterarStatus(new StatusPedido(dados.status))
    if (dados.valor_total !== undefined) pedidoAtual.atualizarValor(new Dinheiro(Number(dados.valor_total)))
    
    if (dados.destino_latitude !== undefined || dados.destino_longitude !== undefined) {
      const lat = dados.destino_latitude !== undefined ? Number(dados.destino_latitude) : pedidoAtual.destino.latitude
      const lon = dados.destino_longitude !== undefined ? Number(dados.destino_longitude) : pedidoAtual.destino.longitude
      pedidoAtual.atualizarEnderecoEntrega(new Coordenada(lat, lon))
    }

    const result = await this.repository.editarPedidoPorId(id, pedidoAtual)

    // Se transicionou de PENDENTE para EM_PREPARO_ENTREGA, cria entrega e publica RabbitMQ
    if (statusAnterior === 'PENDENTE' && result.status === 'EM_PREPARO_ENTREGA') {
      const entregaExistente = await this.entregaRepository.buscarEntregaPorPedidoId(result.id!)
      if (entregaExistente.length === 0) {
        const novaEntrega = Entrega.criar({
          pedido_id: result.id!,
          entregador_id: null,
          status: 'PENDENTE',
          previsao_entrega: null
        })
        await this.entregaRepository.criarEntrega(novaEntrega)
      }

      // Publica o evento pedido.confirmado assincronamente
      rabbitMQPublisher.publish('pedido.confirmado', {
        id: result.id,
        usuario_id: result.usuario_id,
        restaurante_id: result.restaurante_id,
        status: result.status,
        valor_total: Number(result.valor_total),
        destino_latitude: result.destino_latitude,
        destino_longitude: result.destino_longitude,
        data_criacao: result.data_criacao
      }).catch((err) => {
        console.error('Erro ao publicar evento pedido.confirmado:', err);
      });
    }

    return result
  }

  async deletar(id: number | string): Promise<boolean> {
    return this.repository.deletarPedido(id)
  }
}
