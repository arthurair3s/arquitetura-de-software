import { DomainError } from '../../shared/errors/DomainError.js';

export class ProdutoInvalidoError extends DomainError {
  constructor(message: string) {
    super(message, 'PRODUTO_INVALIDO');
    this.name = 'ProdutoInvalidoError';
  }
}

export class Produto {
  public readonly id?: number;
  private _nome: string;
  private _descricao: string | null;
  private _preco: number;
  public readonly categoria_id: number | null;

  constructor(
    nome: string,
    preco: number,
    id?: number,
    descricao: string | null = null,
    categoria_id: number | null = null
  ) {
    this.id = id;
    this._nome = nome;
    this._preco = preco;
    this._descricao = descricao;
    this.categoria_id = categoria_id;
    this.validar();
  }

  get nome(): string {
    return this._nome;
  }

  set nome(novoNome: string) {
    this._nome = novoNome;
    this.validar();
  }

  get preco(): number {
    return this._preco;
  }

  set preco(novoPreco: number) {
    this._preco = novoPreco;
    this.validar();
  }

  get descricao(): string | null {
    return this._descricao;
  }

  set descricao(novaDesc: string | null) {
    this._descricao = novaDesc;
    this.validar();
  }

  private validar(): void {
    if (!this._nome || this._nome.trim().length === 0) {
      throw new ProdutoInvalidoError('O nome do produto não pode ser vazio.');
    }
    if (this._preco <= 0) {
      throw new ProdutoInvalidoError('O preço do produto deve ser maior que zero.');
    }
    if (this._nome.length > 150) {
      throw new ProdutoInvalidoError('O nome do produto deve ter no máximo 150 caracteres.');
    }
  }

  static criar(dados: {
    nome: string;
    preco: number | any;
    id?: number;
    descricao?: string | null;
    categoria_id?: number | null;
  }): Produto {
    return new Produto(
      dados.nome,
      Number(dados.preco),
      dados.id,
      dados.descricao,
      dados.categoria_id
    );
  }
}
