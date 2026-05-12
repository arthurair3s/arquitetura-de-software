import { DomainError } from '../../shared/errors/DomainError.js';

export class AvaliacaoInvalidaError extends DomainError {
  constructor(message: string) {
    super(message, 'AVALIACAO_INVALIDA');
    this.name = 'AvaliacaoInvalidaError';
  }
}

export class Avaliacao {
  public readonly id?: number;
  public readonly usuario_id: number | null;
  public readonly restaurante_id: number | null;
  private _nota: number;
  private _comentario: string | null;

  constructor(
    nota: number,
    usuario_id: number | null = null,
    restaurante_id: number | null = null,
    comentario: string | null = null,
    id?: number
  ) {
    this.id = id;
    this.usuario_id = usuario_id;
    this.restaurante_id = restaurante_id;
    this._nota = nota;
    this._comentario = comentario;
    this.validar();
  }

  get nota(): number {
    return this._nota;
  }

  set nota(novaNota: number) {
    this._nota = novaNota;
    this.validar();
  }

  get comentario(): string | null {
    return this._comentario;
  }

  set comentario(novoComentario: string | null) {
    this._comentario = novoComentario;
    this.validar();
  }

  private validar(): void {
    if (this._nota < 1 || this._nota > 5) {
      throw new AvaliacaoInvalidaError('A nota deve estar entre 1 e 5.');
    }
    if (this._comentario && this._comentario.length > 500) {
      throw new AvaliacaoInvalidaError('O comentário deve ter no máximo 500 caracteres.');
    }
  }

  static criar(dados: {
    nota: number | null;
    usuario_id?: number | null;
    restaurante_id?: number | null;
    comentario?: string | null;
    id?: number;
  }): Avaliacao {
    return new Avaliacao(
      dados.nota || 0,
      dados.usuario_id,
      dados.restaurante_id,
      dados.comentario,
      dados.id
    );
  }
}
