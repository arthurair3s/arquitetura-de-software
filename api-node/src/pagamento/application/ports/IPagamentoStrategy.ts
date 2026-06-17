import { Pagamento } from '../../domain/Pagamento.js'

export interface IPagamentoStrategy {
  processar(pagamento: Pagamento): Promise<{
    sucesso: boolean
    transacaoId?: string
    status: string
    erro?: string
  }>
}
