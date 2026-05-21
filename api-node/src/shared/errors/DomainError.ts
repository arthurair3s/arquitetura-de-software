/**
 * DomainError
 * 
 * Classe base para todos os erros de domínio (regras de negócio) do sistema.
 * Garante que os erros não relacionados à infraestrutura possam ser facilmente
 * identificados e retornados ao cliente (ex: GraphQL FormatError) de forma segura.
 */
export class DomainError extends Error {
  public code: string;
  public details?: any;

  constructor(message: string, code: string = 'DOMAIN_ERROR', details?: any) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, DomainError.prototype);
  }
}
