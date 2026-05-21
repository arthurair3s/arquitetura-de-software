import { DomainError } from '../../shared/errors/DomainError.js';

export class EntregaInvalidaError extends DomainError {
  constructor(message: string) {
    super(message, 'ENTREGA_INVALIDA');
    this.name = 'EntregaInvalidaError';
  }
}

export class Entrega {
  public readonly id?: number;
  public readonly pedido_id: number;
  public readonly entregador_id: number;
  private _status: string;
  private _previsao_entrega: Date | null;

  constructor(
    pedido_id: number,
    entregador_id: number,
    status: string = 'ATRIBUIDA',
    previsao_entrega: Date | null = null,
    id?: number
  ) {
    this.id = id;
    this.pedido_id = pedido_id;
    this.entregador_id = entregador_id;
    this._status = status;
    this._previsao_entrega = previsao_entrega;

    this.validar();
  }

  get status(): string {
    return this._status;
  }

  set status(novoStatus: string) {
    this._status = novoStatus;
    this.validar();
  }

  get previsao_entrega(): Date | null {
    return this._previsao_entrega;
  }

  set previsao_entrega(novaPrevisao: Date | null) {
    this._previsao_entrega = novaPrevisao;
    this.validar();
  }

  private validar(): void {
    if (this.pedido_id == null || this.pedido_id <= 0) {
      throw new EntregaInvalidaError('ID do pedido inválido.');
    }
    if (this.entregador_id == null || this.entregador_id <= 0) {
      throw new EntregaInvalidaError('ID do entregador inválido.');
    }
    if (!this._status || this._status.trim() === '') {
      throw new EntregaInvalidaError('O status da entrega não pode ser vazio.');
    }
    
    const validStatuses = ['ATRIBUIDA', 'EM_TRANSITO', 'ENTREGUE'];
    if (!validStatuses.includes(this._status.toUpperCase())) {
      throw new EntregaInvalidaError(`Status da entrega inválido. Valores aceitos: ${validStatuses.join(', ')}`);
    }
  }

  static criar(dados: {
    pedido_id: number | string | null;
    entregador_id: number | string | null;
    status?: string | null;
    previsao_entrega?: Date | string | null;
    id?: number;
  }): Entrega {
    let dt = null;
    if (dados.previsao_entrega) {
      dt = new Date(dados.previsao_entrega);
    }
    return new Entrega(
      Number(dados.pedido_id),
      Number(dados.entregador_id),
      dados.status || 'ATRIBUIDA',
      dt,
      dados.id
    );
  }
}
