import { DomainError } from '../../shared/errors/DomainError.js';

export class RestauranteInvalidoError extends DomainError {
  constructor(message: string) {
    super(message, 'RESTAURANTE_INVALIDO');
    this.name = 'RestauranteInvalidoError';
  }
}

export class Restaurante {
  public readonly id?: number;
  private _nome: string;
  private _descricao: string | null;
  private _endereco: string | null;
  private _latitude: number | null;
  private _longitude: number | null;

  constructor(
    nome: string,
    descricao: string | null = null,
    endereco: string | null = null,
    latitude: number | null = null,
    longitude: number | null = null,
    id?: number
  ) {
    this.id = id;
    this._nome = nome;
    this._descricao = descricao;
    this._endereco = endereco;
    this._latitude = latitude;
    this._longitude = longitude;

    this.validar();
  }

  get nome(): string {
    return this._nome;
  }

  set nome(novoNome: string) {
    this._nome = novoNome;
    this.validar();
  }

  get descricao(): string | null {
    return this._descricao;
  }

  set descricao(novaDescricao: string | null) {
    this._descricao = novaDescricao;
    this.validar();
  }

  get endereco(): string | null {
    return this._endereco;
  }

  set endereco(novoEndereco: string | null) {
    this._endereco = novoEndereco;
    this.validar();
  }

  get latitude(): number | null {
    return this._latitude;
  }

  set latitude(novaLat: number | null) {
    this._latitude = novaLat;
    this.validar();
  }

  get longitude(): number | null {
    return this._longitude;
  }

  set longitude(novaLong: number | null) {
    this._longitude = novaLong;
    this.validar();
  }

  private validar(): void {
    if (!this._nome || this._nome.trim().length < 2) {
      throw new RestauranteInvalidoError('O nome do restaurante deve ter pelo menos 2 caracteres.');
    }
    if (this._nome.length > 150) {
      throw new RestauranteInvalidoError('O nome do restaurante não pode exceder 150 caracteres.');
    }

    if (this._latitude !== null && this._latitude !== undefined) {
      if (this._latitude < -90 || this._latitude > 90) {
        throw new RestauranteInvalidoError('A latitude deve estar entre -90 e 90.');
      }
    }

    if (this._longitude !== null && this._longitude !== undefined) {
      if (this._longitude < -180 || this._longitude > 180) {
        throw new RestauranteInvalidoError('A longitude deve estar entre -180 e 180.');
      }
    }
  }

  static criar(dados: {
    nome: string;
    descricao?: string | null;
    endereco?: string | null;
    latitude?: any;
    longitude?: any;
    id?: number;
  }): Restaurante {
    return new Restaurante(
      dados.nome,
      dados.descricao || null,
      dados.endereco || null,
      dados.latitude != null ? Number(dados.latitude) : null,
      dados.longitude != null ? Number(dados.longitude) : null,
      dados.id
    );
  }
}
