import { DomainError } from '../../shared/errors/DomainError.js';

export class StatusEntregadorInvalidoError extends DomainError {
  constructor(message: string) {
    super(message, 'STATUS_ENTREGADOR_INVALIDO');
    this.name = 'StatusEntregadorInvalidoError';
  }
}

export type StatusEntregadorTipo = 'OFFLINE' | 'DISPONIVEL' | 'EM_ENTREGA';

export class StatusEntregador {
  private readonly _valor: StatusEntregadorTipo;

  constructor(valor: string) {
    const normalizado = StatusEntregador.normalizar(valor);
    if (!normalizado) {
      throw new StatusEntregadorInvalidoError(`Status de entregador inválido: '${valor}'`);
    }
    this._valor = normalizado;
  }

  /**
   * converte valores numéricos vindos do gRPC para a representação textual canônica.
   * esse método deve ser chamado apenas na camada de infraestrutura.
   */
  static deGrpc(valor: string | number): StatusEntregador {
    const strValor = String(valor);
    const map: Record<string, StatusEntregadorTipo> = {
      '0': 'OFFLINE',
      '1': 'DISPONIVEL',
      '2': 'EM_ENTREGA',
    };
    const textual = map[strValor];
    if (textual) return new StatusEntregador(textual);
    return new StatusEntregador(strValor);
  }

  private static normalizar(valor: string): StatusEntregadorTipo | null {
    const validos: StatusEntregadorTipo[] = ['OFFLINE', 'DISPONIVEL', 'EM_ENTREGA'];
    const upper = valor.toUpperCase() as StatusEntregadorTipo;
    return validos.includes(upper) ? upper : null;
  }

  get valor(): StatusEntregadorTipo {
    return this._valor;
  }

  public estaDisponivel(): boolean {
    return this._valor === 'DISPONIVEL';
  }

  public estaEmEntrega(): boolean {
    return this._valor === 'EM_ENTREGA';
  }

  public podeTransicionarPara(novoStatus: StatusEntregador): boolean {
    const regras: Record<StatusEntregadorTipo, StatusEntregadorTipo[]> = {
      'OFFLINE':    ['DISPONIVEL'],
      'DISPONIVEL': ['EM_ENTREGA', 'OFFLINE'],
      'EM_ENTREGA': ['DISPONIVEL', 'OFFLINE'],
    };
    return regras[this._valor].includes(novoStatus.valor);
  }

  public equals(outro: StatusEntregador): boolean {
    return this._valor === outro.valor;
  }

  public toString(): string {
    return this._valor;
  }
}
