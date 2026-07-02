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

  private _role: string;
  private _entregador_id: number | null;
  private _restaurante_id: number | null;

  constructor(
    nome: string,
    email: Email,
    telefone: string | null = null,
    senha: SenhaHash | null = null,
    coordenada: Coordenada | null = null,
    endereco: string | null = null,
    role: string = 'CLIENTE',
    entregador_id: number | null = null,
    restaurante_id: number | null = null,
    id?: number
  ) {
    this.id = id;
    this._nome = nome;
    this._email = email;
    this._telefone = telefone;
    this._senha = senha;
    this._coordenada = coordenada;
    this._endereco = endereco;
    this._role = role;
    this._entregador_id = entregador_id;
    this._restaurante_id = restaurante_id;

    this.validar();
  }

  get nome(): string { return this._nome; }

  get emailObj(): Email { return this._email; }

  get telefone(): string | null { return this._telefone; }

  get senhaObj(): SenhaHash | null { return this._senha; }

  get role(): string { return this._role; }

  get entregador_id(): number | null { return this._entregador_id; }

  get restaurante_id(): number | null { return this._restaurante_id; }

  set role(novaRole: string) { this._role = novaRole; }

  set entregador_id(id: number | null) { this._entregador_id = id; }

  set restaurante_id(id: number | null) { this._restaurante_id = id; }

  public atualizarPerfil(nome: string, email: Email, telefone: string | null): void {
    this._nome = nome;
    this._email = email;
    this._telefone = telefone;
    this.validar();
  }

  public alterarSenha(novaSenha: SenhaHash): void {
    this._senha = novaSenha;
    this.validar();
  }

  get coordenada(): Coordenada | null { return this._coordenada; }

  get endereco(): string | null { return this._endereco; }

  // Atalhos para compatibilidade
  get email(): string { return this._email.valor; }

  get latitude(): number | null { return this._coordenada?.latitude ?? null; }

  get longitude(): number | null { return this._coordenada?.longitude ?? null; }

  public atualizarEndereco(coordenada: Coordenada | null, endereco: string | null): void {
    this._coordenada = coordenada;
    this._endereco = endereco;
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
    role?: string;
    entregador_id?: number | null;
    restaurante_id?: number | null;
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
      dados.role || 'CLIENTE',
      dados.entregador_id != null ? Number(dados.entregador_id) : null,
      dados.restaurante_id != null ? Number(dados.restaurante_id) : null,
      dados.id
    );
  }
}
