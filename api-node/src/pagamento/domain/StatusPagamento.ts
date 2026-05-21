import { DomainError } from '../../shared/errors/DomainError.js';

export class StatusPagamentoInvalidoError extends DomainError {
  constructor(message: string) {
    super(message, 'STATUS_PAGAMENTO_INVALIDO');
    this.name = 'StatusPagamentoInvalidoError';
  }
}

export type StatusPagamentoTipo = 'PENDENTE' | 'APROVADO' | 'RECUSADO' | 'REEMBOLSADO';

export class StatusPagamento {
  private readonly _valor: StatusPagamentoTipo;

  constructor(valor: string) {
    this.validar(valor);
    this._valor = valor.toUpperCase() as StatusPagamentoTipo;
  }

  private validar(valor: string): void {
    const validos: StatusPagamentoTipo[] = ['PENDENTE', 'APROVADO', 'RECUSADO', 'REEMBOLSADO'];
    if (!valor || !validos.includes(valor.toUpperCase() as StatusPagamentoTipo)) {
      throw new StatusPagamentoInvalidoError(`Status de pagamento inválido: '${valor}'. Valores aceitos: ${validos.join(', ')}`);
    }
  }

  get valor(): StatusPagamentoTipo {
    return this._valor;
  }

  public podeTransicionarPara(novoStatus: StatusPagamento): boolean {
    const regras: Record<StatusPagamentoTipo, StatusPagamentoTipo[]> = {
      'PENDENTE':    ['APROVADO', 'RECUSADO'],
      'APROVADO':    ['REEMBOLSADO'],
      'RECUSADO':    [],
      'REEMBOLSADO': [],
    };
    return regras[this._valor].includes(novoStatus.valor);
  }

  public equals(outro: StatusPagamento): boolean {
    return this._valor === outro.valor;
  }

  public toString(): string {
    return this._valor;
  }
}
