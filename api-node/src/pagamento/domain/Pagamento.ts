import { DomainError } from '../../shared/errors/DomainError.js';

export class PagamentoInvalidoError extends DomainError {
  constructor(message: string) {
    super(message, 'PAGAMENTO_INVALIDO');
    this.name = 'PagamentoInvalidoError';
  }
}

export class Pagamento {
  public readonly id?: number;
  public readonly pedido_id: number;
  private _metodo: string;
  private _status: string;
  private _valor: number;

  constructor(pedido_id: number, metodo: string, valor: number, status: string = 'PENDENTE', id?: number) {
    this.id = id;
    this.pedido_id = pedido_id;
    this._metodo = metodo;
    this._status = status;
    this._valor = valor;
    
    this.validar();
  }

  get metodo(): string {
    return this._metodo;
  }

  set metodo(novoMetodo: string) {
    this._metodo = novoMetodo;
    this.validar();
  }

  get status(): string {
    return this._status;
  }

  set status(novoStatus: string) {
    this._status = novoStatus;
    this.validar();
  }

  get valor(): number {
    return this._valor;
  }

  set valor(novoValor: number) {
    this._valor = novoValor;
    this.validar();
  }

  private validar(): void {
    if (!this._metodo || this._metodo.trim().length < 2) {
      throw new PagamentoInvalidoError('O método de pagamento deve ter pelo menos 2 caracteres.');
    }
    if (this._valor < 0) {
      throw new PagamentoInvalidoError('O valor do pagamento não pode ser negativo.');
    }
    if (!this._status || this._status.trim().length === 0) {
      throw new PagamentoInvalidoError('O status do pagamento não pode ser vazio.');
    }
    if (this.pedido_id == null || this.pedido_id <= 0) {
      throw new PagamentoInvalidoError('ID do pedido inválido.');
    }
  }

  static criar(dados: { 
    pedido_id: number | null; 
    metodo: string | null; 
    valor: any; 
    status: string | null; 
    id?: number 
  }): Pagamento {
    return new Pagamento(
      Number(dados.pedido_id), 
      dados.metodo || '', 
      Number(dados.valor), 
      dados.status || 'PENDENTE', 
      dados.id
    );
  }
}
