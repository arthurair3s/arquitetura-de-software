import { DomainError } from '../../shared/errors/DomainError.js';

export class StatusPedidoInvalidoError extends DomainError {
  constructor(message: string) {
    super(message, 'STATUS_PEDIDO_INVALIDO');
    this.name = 'StatusPedidoInvalidoError';
  }
}

export type StatusPedidoTipo = 
  | 'PENDENTE'
  | 'EM_PREPARO_ENTREGA'
  | 'SAIU_PARA_ENTREGA'
  | 'ENTREGUE'
  | 'CANCELADO';

export class StatusPedido {
  private readonly _valor: StatusPedidoTipo;

  constructor(valor: string) {
    this.validar(valor);
    this._valor = valor as StatusPedidoTipo;
  }

  private validar(valor: string): void {
    const validos = ['PENDENTE', 'EM_PREPARO_ENTREGA', 'SAIU_PARA_ENTREGA', 'ENTREGUE', 'CANCELADO'];
    if (!validos.includes(valor)) {
      throw new StatusPedidoInvalidoError(`Status de pedido inválido: ${valor}`);
    }
  }

  get valor(): StatusPedidoTipo {
    return this._valor;
  }

  public podeTransicionarPara(novoStatus: StatusPedido): boolean {
    const regras: Record<StatusPedidoTipo, StatusPedidoTipo[]> = {
      'PENDENTE': ['EM_PREPARO_ENTREGA', 'CANCELADO'],
      'EM_PREPARO_ENTREGA': ['SAIU_PARA_ENTREGA', 'CANCELADO'],
      'SAIU_PARA_ENTREGA': ['ENTREGUE', 'CANCELADO'],
      'ENTREGUE': [],
      'CANCELADO': []
    };

    return regras[this._valor].includes(novoStatus.valor);
  }

  public equals(outro: StatusPedido): boolean {
    return this._valor === outro.valor;
  }

  public toString(): string {
    return this._valor;
  }
}
