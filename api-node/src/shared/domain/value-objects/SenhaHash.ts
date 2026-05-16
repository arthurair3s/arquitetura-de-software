import bcrypt from 'bcryptjs';
import { DomainError } from '../../errors/DomainError.js';

export class SenhaHashInvalidaError extends DomainError {
  constructor(message: string) {
    super(message, 'SENHA_HASH_INVALIDA');
    this.name = 'SenhaHashInvalidaError';
  }
}

export class SenhaHash {
  private readonly _hash: string;

  constructor(hash: string) {
    this._hash = hash;
    this.validar();
  }

  private validar(): void {

    if (!this._hash || !this._hash.startsWith('$2') || this._hash.length < 50) {
      throw new SenhaHashInvalidaError('O hash da senha parece inválido.');
    }
  }

  get valor(): string {
    return this._hash;
  }

  // compara uma senha plana com o hash atual
  public async comparar(senhaPlana: string): Promise<boolean> {
    return bcrypt.compare(senhaPlana, this._hash);
  }

  // factory method para cria um hash a partir de uma senha plana
  static async deSenhaPlana(senhaPlana: string): Promise<SenhaHash> {
    if (!senhaPlana || senhaPlana.length < 6) {
      throw new SenhaHashInvalidaError('A senha deve ter pelo menos 6 caracteres.');
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(senhaPlana, salt);
    return new SenhaHash(hash);
  }

  public toString(): string {
    return this._hash;
  }
}
