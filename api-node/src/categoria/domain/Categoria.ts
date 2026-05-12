import { DomainError } from '../../shared/errors/DomainError.js';

export class CategoriaInvalidaError extends DomainError {
  constructor(message: string) {
    super(message, 'CATEGORIA_INVALIDA');
    this.name = 'CategoriaInvalidaError';
  }
}

export class Categoria {
  public readonly id?: number;
  private _nome: string;
  public readonly restaurante_id?: number | null;

  constructor(nome: string, id?: number, restaurante_id?: number | null) {
    this.id = id;
    this.restaurante_id = restaurante_id;
    this._nome = nome;
    this.validar();
  }

  get nome(): string {
    return this._nome;
  }

  set nome(novoNome: string) {
    this._nome = novoNome;
    this.validar();
  }

  private validar(): void {
    if (!this._nome || this._nome.trim().length === 0) {
      throw new CategoriaInvalidaError('O nome da categoria não pode ser vazio.');
    }
    if (this._nome.length > 100) {
      throw new CategoriaInvalidaError('O nome da categoria deve ter no máximo 100 caracteres.');
    }
  }

  // Mapper simples para construir a partir dos dados do banco/inputs
  static criar(dados: { nome: string; id?: number; restaurante_id?: number | null }): Categoria {
    return new Categoria(dados.nome, dados.id, dados.restaurante_id);
  }
}
