import { DomainError } from '../../errors/DomainError.js';

export class DinheiroInvalidoError extends DomainError {
  constructor(message: string) {
    super(message, 'DINHEIRO_INVALIDO');
    this.name = 'DinheiroInvalidoError';
  }
}

export class Dinheiro {
  private readonly _centavos: number;

  constructor(valor: number, isCentavos = false) {
    if (isCentavos) {
      this._centavos = Math.round(valor);
    } else {
      this._centavos = Math.round(valor * 100);
    }
    this.validar();
  }

  private validar(): void {
    if (this._centavos < 0) {
      throw new DinheiroInvalidoError('O valor monetário não pode ser negativo.');
    }
  }

  get valor(): number {
    return this._centavos / 100;
  }

  get centavos(): number {
    return this._centavos;
  }

  public somar(outro: Dinheiro): Dinheiro {
    return new Dinheiro(this._centavos + outro.centavos, true);
  }

  public subtrair(outro: Dinheiro): Dinheiro {
    return new Dinheiro(this._centavos - outro.centavos, true);
  }

  public multiplicar(fator: number): Dinheiro {
    return new Dinheiro(this._centavos * fator, true);
  }

  public equals(outro: Dinheiro): boolean {
    return this._centavos === outro.centavos;
  }

  public formatarBRL(): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(this.valor);
  }

  static zero(): Dinheiro {
    return new Dinheiro(0, true);
  }
}
