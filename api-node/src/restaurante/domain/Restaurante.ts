import { DomainError } from '../../shared/errors/DomainError.js';
import { Coordenada } from '../../shared/domain/value-objects/Coordenada.js';

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
  private _coordenada: Coordenada | null;

  constructor(
    nome: string,
    descricao: string | null = null,
    endereco: string | null = null,
    coordenada: Coordenada | null = null,
    id?: number
  ) {
    this.id = id;
    this._nome = nome;
    this._descricao = descricao;
    this._endereco = endereco;
    this._coordenada = coordenada;

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

  get coordenada(): Coordenada | null {
    return this._coordenada;
  }

  set coordenada(novaCoordenada: Coordenada | null) {
    this._coordenada = novaCoordenada;
    this.validar();
  }

  // atalhos para compatibilidade (podem ser removidos futuramente se tudo usar .coordenada)
  get latitude(): number | null {
    return this._coordenada?.latitude ?? null;
  }

  get longitude(): number | null {
    return this._coordenada?.longitude ?? null;
  }

  private validar(): void {
    if (!this._nome || this._nome.trim().length < 2) {
      throw new RestauranteInvalidoError('O nome do restaurante deve ter pelo menos 2 caracteres.');
    }
    if (this._nome.length > 150) {
      throw new RestauranteInvalidoError('O nome do restaurante não pode exceder 150 caracteres.');
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
    let coordenada = null;
    if (dados.latitude != null && dados.longitude != null) {
      coordenada = new Coordenada(Number(dados.latitude), Number(dados.longitude));
    }

    return new Restaurante(
      dados.nome,
      dados.descricao || null,
      dados.endereco || null,
      coordenada,
      dados.id
    );
  }
}
