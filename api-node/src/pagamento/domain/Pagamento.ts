import { DomainError } from '../../shared/errors/DomainError.js';
import { Dinheiro } from '../../shared/domain/value-objects/Dinheiro.js';
import { StatusPagamento } from './StatusPagamento.js';

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
  private _status: StatusPagamento;
  private _valor: Dinheiro;

  constructor(pedido_id: number, metodo: string, valor: Dinheiro, status: StatusPagamento, id?: number) {
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

  get statusObj(): StatusPagamento {
    return this._status;
  }

  public alterarStatus(novoStatus: StatusPagamento): void {
    if (!this._status.podeTransicionarPara(novoStatus)) {
      throw new PagamentoInvalidoError(`Transição de status inválida: ${this._status.valor} -> ${novoStatus.valor}`);
    }
    this._status = novoStatus;
  }

  // Atalho para compatibilidade
  get status(): string {
    return this._status.valor;
  }

  set status(novoStatus: string) {
    this._status = new StatusPagamento(novoStatus);
    this.validar();
  }

  get valorObj(): Dinheiro {
    return this._valor;
  }

  set valorObj(novoValor: Dinheiro) {
    this._valor = novoValor;
    this.validar();
  }

  // Atalho para compatibilidade
  get valor(): number {
    return this._valor.valor;
  }

  private validar(): void {
    if (!this._metodo || this._metodo.trim().length < 2) {
      throw new PagamentoInvalidoError('O método de pagamento deve ter pelo menos 2 caracteres.');
    }
    if (this._valor.valor < 0) {
      throw new PagamentoInvalidoError('O valor do pagamento não pode ser negativo.');
    }
    if (this.pedido_id == null || this.pedido_id <= 0) {
      throw new PagamentoInvalidoError('ID do pedido inválido.');
    }
  }

  static criar(dados: { 
    pedido_id: number | null; 
    metodo: string | null; 
    valor: any; 
    statusObj?: StatusPagamento; 
    status?: string | null; 
    id?: number 
  }): Pagamento {
    const statusInicial = dados.statusObj || new StatusPagamento(dados.status || 'PENDENTE');
    return new Pagamento(
      Number(dados.pedido_id), 
      dados.metodo || '', 
      new Dinheiro(Number(dados.valor)), 
      statusInicial, 
      dados.id
    );
  }
}
