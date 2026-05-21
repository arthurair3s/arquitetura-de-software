import { DomainError } from '../../errors/DomainError.js';

export class EmailInvalidoError extends DomainError {
  constructor(message: string) {
    super(message, 'EMAIL_INVALIDO');
    this.name = 'EmailInvalidoError';
  }
}

export class Email {
  private readonly _valor: string;

  constructor(valor: string) {
    this._valor = valor.trim().toLowerCase();
    this.validar();
  }

  private validar(): void {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(this._valor)) {
      throw new EmailInvalidoError(`O e-mail '${this._valor}' é inválido.`);
    }
  }

  get valor(): string {
    return this._valor;
  }

  public equals(outro: Email): boolean {
    return this._valor === outro.valor;
  }

  public toString(): string {
    return this._valor;
  }
}
