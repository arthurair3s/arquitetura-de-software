import { DomainError } from '../../shared/errors/DomainError.js';
import { Coordenada } from '../../shared/domain/value-objects/Coordenada.js';
import { StatusEntregador } from './StatusEntregador.js';

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
  private _status: StatusEntregador;
  private _coordenada: Coordenada | null;

  constructor(
    nome: string | null = null,
    telefone: string | null = null,
    veiculo: string | null = null,
    status: StatusEntregador,
    coordenada: Coordenada | null = null,
    id?: number
  ) {
    this.id = id;
    this._nome = nome;
    this._telefone = telefone;
    this._veiculo = veiculo;
    this._status = status;
    this._coordenada = coordenada;

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

  get statusObj(): StatusEntregador { return this._status; }
  
  public alterarStatus(novoStatus: StatusEntregador): void {
    if (!this._status.podeTransicionarPara(novoStatus)) {
      throw new EntregadorInvalidoError(`Transição de status inválida: ${this._status.valor} -> ${novoStatus.valor}`);
    }
    this._status = novoStatus;
  }

  // Atalho para compatibilidade
  get status(): string { return this._status.valor; }
  
  set status(novoStatus: string) {
    this._status = new StatusEntregador(novoStatus);
    this.validar();
  }

  get coordenada(): Coordenada | null {
    return this._coordenada;
  }

  set coordenada(novaCoordenada: Coordenada | null) {
    this._coordenada = novaCoordenada;
    this.validar();
  }

  // Atalhos para compatibilidade
  get latitude(): number | null {
    return this._coordenada?.latitude ?? null;
  }

  get longitude(): number | null {
    return this._coordenada?.longitude ?? null;
  }

  private validar(): void {
    if (this._nome && this._nome.trim().length < 2) {
      throw new EntregadorInvalidoError('O nome do entregador deve ter pelo menos 2 caracteres.');
    }
  }

  static criar(dados: {
    nome?: string | null;
    telefone?: string | null;
    veiculo?: string | null;
    statusObj?: StatusEntregador;
    latitude?: any;
    longitude?: any;
    id?: number;
  }): Entregador {
    let coordenada = null;
    if (dados.latitude != null && dados.longitude != null) {
      coordenada = new Coordenada(Number(dados.latitude), Number(dados.longitude));
    }
    
    const statusInicial = dados.statusObj || new StatusEntregador('DISPONIVEL');

    return new Entregador(
      dados.nome || null,
      dados.telefone || null,
      dados.veiculo || null,
      statusInicial,
      coordenada,
      dados.id
    );
  }
}
