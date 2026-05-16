import { DomainError } from '../../shared/errors/DomainError.js';
import { Email } from '../../shared/domain/value-objects/Email.js';
import { SenhaHash } from '../../shared/domain/value-objects/SenhaHash.js';
import { Coordenada } from '../../shared/domain/value-objects/Coordenada.js';

export class UsuarioInvalidoError extends DomainError {
  constructor(message: string) {
    super(message, 'USUARIO_INVALIDO');
    this.name = 'UsuarioInvalidoError';
  }
}

export class Usuario {
  public readonly id?: number;
  private _nome: string;
  private _email: Email;
  private _telefone: string | null;
  private _senha: SenhaHash | null;
  private _coordenada: Coordenada | null;
  private _endereco: string | null;

  constructor(
    nome: string,
    email: Email,
    telefone: string | null = null,
    senha: SenhaHash | null = null,
    coordenada: Coordenada | null = null,
    endereco: string | null = null,
    id?: number
  ) {
    this.id = id;
    this._nome = nome;
    this._email = email;
    this._telefone = telefone;
    this._senha = senha;
    this._coordenada = coordenada;
    this._endereco = endereco;

    this.validar();
  }

  get nome(): string { return this._nome; }
  set nome(novoNome: string) {
    this._nome = novoNome;
    this.validar();
  }

  get emailObj(): Email { return this._email; }
  set emailObj(novoEmail: Email) {
    this._email = novoEmail;
    this.validar();
  }

  // atalho para compatibilidade
  get email(): string { return this._email.valor; }

  get telefone(): string | null { return this._telefone; }
  set telefone(novoTelefone: string | null) {
    this._telefone = novoTelefone;
    this.validar();
  }

  get senhaObj(): SenhaHash | null { return this._senha; }
  set senhaObj(novaSenha: SenhaHash | null) {
    this._senha = novaSenha;
    this.validar();
  }

  // atalho para compatibilidade
  get senha(): string | null { return this._senha?.valor ?? null; }

  get coordenada(): Coordenada | null { return this._coordenada; }
  set coordenada(novaCoord: Coordenada | null) {
    this._coordenada = novaCoord;
    this.validar();
  }

  // atalhos para compatibilidade
  get latitude(): number | null { return this._coordenada?.latitude ?? null; }
  get longitude(): number | null { return this._coordenada?.longitude ?? null; }

  get endereco(): string | null { return this._endereco; }
  set endereco(novoEndereco: string | null) {
    this._endereco = novoEndereco;
    this.validar();
  }

  private validar(): void {
    if (!this._nome || this._nome.trim().length < 3) {
      throw new UsuarioInvalidoError('O nome do usuário deve ter pelo menos 3 caracteres.');
    }
  }

  static criar(dados: {
    nome: string;
    email: string;
    telefone?: string | null;
    senha?: string | null;
    latitude?: any;
    longitude?: any;
    endereco?: string | null;
    id?: number;
  }): Usuario {
    const coordenada = (dados.latitude != null && dados.longitude != null)
      ? new Coordenada(Number(dados.latitude), Number(dados.longitude))
      : null;

    return new Usuario(
      dados.nome,
      new Email(dados.email),
      dados.telefone || null,
      dados.senha ? new SenhaHash(dados.senha) : null,
      coordenada,
      dados.endereco || null,
      dados.id
    );
  }
}
