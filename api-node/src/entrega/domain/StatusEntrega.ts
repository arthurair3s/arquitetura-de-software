import { DomainError } from '../../shared/errors/DomainError.js';

export class StatusEntregaInvalidoError extends DomainError {
  constructor(message: string) {
    super(message, 'STATUS_ENTREGA_INVALIDO');
    this.name = 'StatusEntregaInvalidoError';
  }
}

export type StatusEntregaTipo = 
  | 'ATRIBUIDA'
  | 'EM_TRANSITO'
  | 'ENTREGUE'
  | 'CANCELADA';

export class StatusEntrega {
  private readonly _valor: StatusEntregaTipo;

  constructor(valor: string) {
    this.validar(valor);
    this._valor = valor.toUpperCase() as StatusEntregaTipo;
  }

  private validar(valor: string): void {
    const validos = ['ATRIBUIDA', 'EM_TRANSITO', 'ENTREGUE', 'CANCELADA'];
    if (!valor || !validos.includes(valor.toUpperCase())) {
      throw new StatusEntregaInvalidoError(`Status de entrega inválido: ${valor}`);
    }
  }

  get valor(): StatusEntregaTipo {
    return this._valor;
  }

  public podeTransicionarPara(novoStatus: StatusEntrega): boolean {
    const regras: Record<StatusEntregaTipo, StatusEntregaTipo[]> = {
      'ATRIBUIDA': ['EM_TRANSITO', 'CANCELADA'],
      'EM_TRANSITO': ['ENTREGUE', 'CANCELADA'],
      'ENTREGUE': [],
      'CANCELADA': []
    };

    return regras[this._valor].includes(novoStatus.valor);
  }

  public equals(outro: StatusEntrega): boolean {
    return this._valor === outro.valor;
  }

  public toString(): string {
    return this._valor;
  }
}
