import { DomainError } from '../../shared/errors/DomainError.js';
import { Coordenada } from '../../shared/domain/value-objects/Coordenada.js';
import { Dinheiro } from '../../shared/domain/value-objects/Dinheiro.js';
import { StatusPedido } from './StatusPedido.js';

export class PedidoInvalidoError extends DomainError {
  constructor(message: string) {
    super(message, 'PEDIDO_INVALIDO');
    this.name = 'PedidoInvalidoError';
  }
}

export class Pedido {
  public readonly id?: number;
  public readonly usuario_id: number;
  public readonly restaurante_id: number;
  private _status: StatusPedido;
  private _valor_total: Dinheiro;
  private _destino: Coordenada;
  public readonly data_criacao?: Date;

  constructor(
    usuario_id: number,
    restaurante_id: number,
    status: StatusPedido,
    valor_total: Dinheiro,
    destino: Coordenada,
    data_criacao?: Date,
    id?: number
  ) {
    this.id = id;
    this.usuario_id = usuario_id;
    this.restaurante_id = restaurante_id;
    this._status = status;
    this._valor_total = valor_total;
    this._destino = destino;
    this.data_criacao = data_criacao;

    this.validar();
  }

  get statusObj(): StatusPedido {
    return this._status;
  }

  /**
   * Altera o status do pedido garantindo as regras de transição.
   */
  public alterarStatus(novoStatus: StatusPedido): void {
    if (!this._status.podeTransicionarPara(novoStatus)) {
      throw new PedidoInvalidoError(`Transição de status inválida: ${this._status.valor} -> ${novoStatus.valor}`);
    }
    this._status = novoStatus;
  }

  // Atalho para compatibilidade (não deve ser usado para alterar status complexos)
  get status(): string {
    return this._status.valor;
  }

  set status(novoStatus: string) {
    this._status = new StatusPedido(novoStatus);
    this.validar();
  }

  get valor(): Dinheiro {
    return this._valor_total;
  }

  set valor(novoValor: Dinheiro) {
    this._valor_total = novoValor;
    this.validar();
  }

  // Atalho para compatibilidade
  get valor_total(): number {
    return this._valor_total.valor;
  }

  get destino(): Coordenada {
    return this._destino;
  }

  set destino(novaCoordenada: Coordenada) {
    this._destino = novaCoordenada;
    this.validar();
  }

  // Atalhos para compatibilidade
  get destino_latitude(): number {
    return this._destino.latitude;
  }

  get destino_longitude(): number {
    return this._destino.longitude;
  }

  private validar(): void {
    if (this.usuario_id == null || this.usuario_id <= 0) {
      throw new PedidoInvalidoError('ID do usuário inválido.');
    }
    if (this.restaurante_id == null || this.restaurante_id <= 0) {
      throw new PedidoInvalidoError('ID do restaurante inválido.');
    }
    if (this._valor_total.valor < 0) {
      throw new PedidoInvalidoError('O valor total do pedido não pode ser negativo.');
    }
  }

  static criar(dados: {
    usuario_id: number | null;
    restaurante_id: number | null;
    status: string | null;
    valor_total: any;
    destino_latitude: any;
    destino_longitude: any;
    data_criacao?: Date | null;
    id?: number;
  }): Pedido {
    const destino = new Coordenada(
      Number(dados.destino_latitude),
      Number(dados.destino_longitude)
    );

    return new Pedido(
      Number(dados.usuario_id),
      Number(dados.restaurante_id),
      new StatusPedido(dados.status || 'PENDENTE'),
      new Dinheiro(Number(dados.valor_total || 0)),
      destino,
      dados.data_criacao || undefined,
      dados.id
    );
  }
}
