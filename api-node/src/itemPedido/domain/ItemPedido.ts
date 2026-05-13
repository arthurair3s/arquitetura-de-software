import { DomainError } from '../../shared/errors/DomainError.js';

export class ItemPedidoInvalidoError extends DomainError {
  constructor(message: string) {
    super(message, 'ITEM_PEDIDO_INVALIDO');
    this.name = 'ItemPedidoInvalidoError';
  }
}

export class ItemPedido {
  public readonly id?: number;
  public readonly pedido_id: number;
  public readonly produto_id: number;
  private _quantidade: number;
  private _preco_unitario: number;

  constructor(pedido_id: number, produto_id: number, quantidade: number, preco_unitario: number, id?: number) {
    this.id = id;
    this.pedido_id = pedido_id;
    this.produto_id = produto_id;
    this._quantidade = quantidade;
    this._preco_unitario = preco_unitario;

    this.validar();
  }

  get quantidade(): number {
    return this._quantidade;
  }

  set quantidade(novaQuantidade: number) {
    this._quantidade = novaQuantidade;
    this.validar();
  }

  get preco_unitario(): number {
    return this._preco_unitario;
  }

  set preco_unitario(novoPreco: number) {
    this._preco_unitario = novoPreco;
    this.validar();
  }

  private validar(): void {
    if (this.pedido_id == null || this.pedido_id <= 0) {
      throw new ItemPedidoInvalidoError('ID do pedido inválido.');
    }
    if (this.produto_id == null || this.produto_id <= 0) {
      throw new ItemPedidoInvalidoError('ID do produto inválido.');
    }
    if (this._quantidade == null || this._quantidade <= 0) {
      throw new ItemPedidoInvalidoError('A quantidade deve ser maior que zero.');
    }
    if (this._preco_unitario == null || this._preco_unitario < 0) {
      throw new ItemPedidoInvalidoError('O preço unitário não pode ser negativo.');
    }
  }

  static criar(dados: { 
    pedido_id: number | null; 
    produto_id: number | null; 
    quantidade: number | null; 
    preco_unitario: any; 
    id?: number 
  }): ItemPedido {
    return new ItemPedido(
      Number(dados.pedido_id),
      Number(dados.produto_id),
      Number(dados.quantidade),
      Number(dados.preco_unitario),
      dados.id
    );
  }
}
