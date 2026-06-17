import type { IPagamentoStrategy } from '../../application/ports/IPagamentoStrategy.js'
import type { Pagamento } from '../../domain/Pagamento.js'

export class PagamentoCartaoStrategy implements IPagamentoStrategy {
  async processar(pagamento: Pagamento): Promise<{
    sucesso: boolean
    transacaoId?: string
    status: string
    erro?: string
  }> {
    console.log(`[Cartão Strategy] Processando cartão de crédito para valor de R$ ${pagamento.valor}...`);
    
    // simulação: valores acima de R$ 1000 são rejeitados por limite/saldo insuficiente
    if (pagamento.valor > 1000) {
      console.warn(`[Cartão Strategy] Pagamento de R$ ${pagamento.valor} rejeitado por falta de limite.`);
      return {
        sucesso: false,
        status: 'RECUSADO',
        erro: 'Limite insuficiente no cartão de crédito.'
      }
    }

    const transacaoId = `card_tx_${Math.random().toString(36).substring(2, 11)}`;
    return {
      sucesso: true,
      transacaoId,
      status: 'APROVADO'
    }
  }
}
