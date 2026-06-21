import type { IPedidoRepository } from '../../domain/ports/IPedidoRepository.js';
import type { IUsuarioService } from '../../../usuario/application/ports/IUsuarioService.js';
import { Pedido, PedidoInvalidoError } from '../../domain/Pedido.js';
import { Coordenada } from '../../../shared/domain/value-objects/Coordenada.js';
import { Dinheiro } from '../../../shared/domain/value-objects/Dinheiro.js';
import { StatusPedido } from '../../domain/StatusPedido.js';
import type { IEventPublisher } from '../../../shared/application/ports/IEventPublisher.js';

export interface ConfirmarPedidoInput {
  usuario_id: string | number;
  restaurante_id: string | number;
  destino_latitude?: number | null;
  destino_longitude?: number | null;
  valor_total: number;
}

export class ConfirmarPedidoUseCase {
  constructor(
    private readonly repository: IPedidoRepository,
    private readonly usuarioService: IUsuarioService,
    private readonly eventPublisher: IEventPublisher
  ) {}

  async execute(dados: ConfirmarPedidoInput): Promise<Pedido> {
    let { destino_latitude, destino_longitude, usuario_id, restaurante_id, valor_total } = dados;

    if (destino_latitude == null || destino_longitude == null) {
      const usuario = await this.usuarioService.buscarPorId(usuario_id);
      if (!usuario || usuario.coordenada?.latitude == null || usuario.coordenada?.longitude == null) {
        throw new PedidoInvalidoError('Endereço de entrega não definido no perfil do usuário.');
      }
      destino_latitude = usuario.coordenada.latitude;
      destino_longitude = usuario.coordenada.longitude;
    }

    const destino = new Coordenada(Number(destino_latitude), Number(destino_longitude));

    const pedido = new Pedido(
      Number(usuario_id),
      Number(restaurante_id),
      new StatusPedido('EM_PREPARO_ENTREGA'),
      new Dinheiro(Number(valor_total)),
      destino
    );

    const result = await this.repository.criarPedido(pedido);

    // publica o evento pedido.confirmado de forma assincrona
    this.eventPublisher.publish('pedido.confirmado', {
      id: result.id,
      usuario_id: result.usuario_id,
      restaurante_id: result.restaurante_id,
      status: result.status,
      valor_total: result.valor_total,
      destino_latitude: result.destino_latitude,
      destino_longitude: result.destino_longitude,
      data_criacao: result.data_criacao
    }).catch((err: unknown) => {
      console.error('Erro ao publicar evento pedido.confirmado:', err);
    });

    return result;
  }
}
