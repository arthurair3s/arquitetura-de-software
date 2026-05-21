import { DomainError } from '../../shared/errors/DomainError.js';

export class UsuarioInvalidoError extends DomainError {
  constructor(message: string) {
    super(message, 'USUARIO_INVALIDO');
    this.name = 'UsuarioInvalidoError';
  }
}

export class Usuario {
  public readonly id?: number;
  private _nome: string;
  private _email: string;
  private _telefone: string | null;
  private _senha: string | null;
  private _latitude: number | null;
  private _longitude: number | null;
  private _endereco: string | null;

  constructor(
    nome: string,
    email: string,
    telefone: string | null = null,
    senha: string | null = null,
    latitude: number | null = null,
    longitude: number | null = null,
    endereco: string | null = null,
    id?: number
  ) {
    this.id = id;
    this._nome = nome;
    this._email = email;
    this._telefone = telefone;
    this._senha = senha;
    this._latitude = latitude;
    this._longitude = longitude;
    this._endereco = endereco;

    this.validar();
  }

  get nome(): string { return this._nome; }
  set nome(novoNome: string) {
    this._nome = novoNome;
    this.validar();
  }

  get email(): string { return this._email; }
  set email(novoEmail: string) {
    this._email = novoEmail;
    this.validar();
  }

  get telefone(): string | null { return this._telefone; }
  set telefone(novoTelefone: string | null) {
    this._telefone = novoTelefone;
    this.validar();
  }

  get senha(): string | null { return this._senha; }
  set senha(novaSenha: string | null) {
    this._senha = novaSenha;
    this.validar();
  }

  get latitude(): number | null { return this._latitude; }
  set latitude(novaLat: number | null) {
    this._latitude = novaLat;
    this.validar();
  }

  get longitude(): number | null { return this._longitude; }
  set longitude(novaLong: number | null) {
    this._longitude = novaLong;
    this.validar();
  }

  get endereco(): string | null { return this._endereco; }
  set endereco(novoEndereco: string | null) {
    this._endereco = novoEndereco;
    this.validar();
  }

  private validar(): void {
    if (!this._nome || this._nome.trim().length < 3) {
      throw new UsuarioInvalidoError('O nome do usuário deve ter pelo menos 3 caracteres.');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this._email || !emailRegex.test(this._email)) {
      throw new UsuarioInvalidoError('Formato de e-mail inválido.');
    }

    if (this._latitude !== null && this._latitude !== undefined) {
      if (this._latitude < -90 || this._latitude > 90) {
        throw new UsuarioInvalidoError('A latitude deve estar entre -90 e 90.');
      }
    }

    if (this._longitude !== null && this._longitude !== undefined) {
      if (this._longitude < -180 || this._longitude > 180) {
        throw new UsuarioInvalidoError('A longitude deve estar entre -180 e 180.');
      }
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
    return new Usuario(
      dados.nome,
      dados.email,
      dados.telefone || null,
      dados.senha || null,
      dados.latitude != null ? Number(dados.latitude) : null,
      dados.longitude != null ? Number(dados.longitude) : null,
      dados.endereco || null,
      dados.id
    );
  }
}
