import type { IPagamentoStrategy } from '../../application/ports/IPagamentoStrategy.js'
import type { Pagamento } from '../../domain/Pagamento.js'

export class PagamentoStripeStrategy implements IPagamentoStrategy {
  private readonly stripeApiKey: string

  constructor() {
    this.stripeApiKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key'
  }

  async processar(pagamento: Pagamento): Promise<{
    sucesso: boolean
    transacaoId?: string
    status: string
    erro?: string
  }> {
    console.log(`[Stripe Strategy] Iniciando integração Stripe (chave: ${this.stripeApiKey.substring(0, 7)}...)...`)
    console.log(`[Stripe Strategy] Efetuando cobrança de R$ ${pagamento.valor} no ambiente Stripe...`)

    // simula uma transacao bem sucedida do Stripe
    const transacaoId = `ch_${Math.random().toString(36).substring(2, 16)}`
    return {
      sucesso: true,
      transacaoId,
      status: 'APROVADO'
    }
  }
}
