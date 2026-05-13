import { DomainError } from '../../shared/errors/DomainError.js';

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
  private _status: string;
  private _valor_total: number;
  private _destino_latitude: number;
  private _destino_longitude: number;
  public readonly data_criacao?: Date;

  constructor(
    usuario_id: number,
    restaurante_id: number,
    status: string,
    valor_total: number,
    destino_latitude: number,
    destino_longitude: number,
    data_criacao?: Date,
    id?: number
  ) {
    this.id = id;
    this.usuario_id = usuario_id;
    this.restaurante_id = restaurante_id;
    this._status = status;
    this._valor_total = valor_total;
    this._destino_latitude = destino_latitude;
    this._destino_longitude = destino_longitude;
    this.data_criacao = data_criacao;

    this.validar();
  }

  get status(): string {
    return this._status;
  }

  set status(novoStatus: string) {
    this._status = novoStatus;
    this.validar();
  }

  get valor_total(): number {
    return this._valor_total;
  }

  set valor_total(novoValor: number) {
    this._valor_total = novoValor;
    this.validar();
  }

  get destino_latitude(): number {
    return this._destino_latitude;
  }

  set destino_latitude(novaLat: number) {
    this._destino_latitude = novaLat;
    this.validar();
  }

  get destino_longitude(): number {
    return this._destino_longitude;
  }

  set destino_longitude(novaLong: number) {
    this._destino_longitude = novaLong;
    this.validar();
  }

  private validar(): void {
    if (this.usuario_id == null || this.usuario_id <= 0) {
      throw new PedidoInvalidoError('ID do usuário inválido.');
    }
    if (this.restaurante_id == null || this.restaurante_id <= 0) {
      throw new PedidoInvalidoError('ID do restaurante inválido.');
    }
    if (this._valor_total == null || this._valor_total < 0) {
      throw new PedidoInvalidoError('O valor total do pedido não pode ser negativo.');
    }
    if (!this._status || this._status.trim() === '') {
      throw new PedidoInvalidoError('O status do pedido não pode ser vazio.');
    }

    if (this._destino_latitude < -90 || this._destino_latitude > 90) {
      throw new PedidoInvalidoError('Latitude de entrega inválida (deve estar entre -90 e 90).');
    }
    if (this._destino_longitude < -180 || this._destino_longitude > 180) {
      throw new PedidoInvalidoError('Longitude de entrega inválida (deve estar entre -180 e 180).');
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
    return new Pedido(
      Number(dados.usuario_id),
      Number(dados.restaurante_id),
      dados.status || 'EM_PREPARO_ENTREGA',
      Number(dados.valor_total || 0),
      Number(dados.destino_latitude),
      Number(dados.destino_longitude),
      dados.data_criacao || undefined,
      dados.id
    );
  }
}
