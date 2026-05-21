import { DomainError } from '../../shared/errors/DomainError.js';

export class EntregadorInvalidoError extends DomainError {
  constructor(message: string) {
    super(message, 'ENTREGADOR_INVALIDO');
    this.name = 'EntregadorInvalidoError';
  }
}

export class Entregador {
  public readonly id?: number;
  private _nome: string | null;
  private _telefone: string | null;
  private _veiculo: string | null;
  private _status: string;
  private _latitude: number | null;
  private _longitude: number | null;

  constructor(
    nome: string | null = null,
    telefone: string | null = null,
    veiculo: string | null = null,
    status: string = 'DISPONIVEL',
    latitude: number | null = null,
    longitude: number | null = null,
    id?: number
  ) {
    this.id = id;
    this._nome = nome;
    this._telefone = telefone;
    this._veiculo = veiculo;
    this._status = status;
    this._latitude = latitude;
    this._longitude = longitude;

    this.validar();
  }

  get nome(): string | null { return this._nome; }
  set nome(novoNome: string | null) {
    this._nome = novoNome;
    this.validar();
  }

  get telefone(): string | null { return this._telefone; }
  set telefone(novoTelefone: string | null) {
    this._telefone = novoTelefone;
    this.validar();
  }

  get veiculo(): string | null { return this._veiculo; }
  set veiculo(novoVeiculo: string | null) {
    this._veiculo = novoVeiculo;
    this.validar();
  }

  get status(): string { return this._status; }
  set status(novoStatus: string) {
    this._status = novoStatus;
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

  private validar(): void {
    if (this._nome && this._nome.trim().length < 2) {
      throw new EntregadorInvalidoError('O nome do entregador deve ter pelo menos 2 caracteres.');
    }

    if (this._status !== 'OFFLINE' && this._status !== 'DISPONIVEL' && this._status !== 'EM_ENTREGA' && this._status !== '0' && this._status !== '1' && this._status !== '2') {
      throw new EntregadorInvalidoError('Status do entregador inválido.');
    }

    if (this._latitude !== null && this._latitude !== undefined) {
      if (this._latitude < -90 || this._latitude > 90) {
        throw new EntregadorInvalidoError('A latitude deve estar entre -90 e 90.');
      }
    }

    if (this._longitude !== null && this._longitude !== undefined) {
      if (this._longitude < -180 || this._longitude > 180) {
        throw new EntregadorInvalidoError('A longitude deve estar entre -180 e 180.');
      }
    }
  }

  static criar(dados: {
    nome?: string | null;
    telefone?: string | null;
    veiculo?: string | null;
    status?: string | number | null;
    latitude?: any;
    longitude?: any;
    id?: number;
  }): Entregador {
    let statusStr = 'DISPONIVEL';
    if (dados.status !== undefined && dados.status !== null) {
      if (dados.status === 0 || dados.status === '0' || dados.status === 'OFFLINE') statusStr = 'OFFLINE';
      else if (dados.status === 1 || dados.status === '1' || dados.status === 'DISPONIVEL') statusStr = 'DISPONIVEL';
      else if (dados.status === 2 || dados.status === '2' || dados.status === 'EM_ENTREGA') statusStr = 'EM_ENTREGA';
      else statusStr = String(dados.status);
    }

    return new Entregador(
      dados.nome || null,
      dados.telefone || null,
      dados.veiculo || null,
      statusStr,
      dados.latitude != null ? Number(dados.latitude) : null,
      dados.longitude != null ? Number(dados.longitude) : null,
      dados.id
    );
  }
}
