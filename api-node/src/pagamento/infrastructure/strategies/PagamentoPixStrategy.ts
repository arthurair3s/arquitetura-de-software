import type { IPagamentoStrategy } from '../../application/ports/IPagamentoStrategy.js'
import type { Pagamento } from '../../domain/Pagamento.js'

export class PagamentoPixStrategy implements IPagamentoStrategy {
  async processar(pagamento: Pagamento): Promise<{
    sucesso: boolean
    transacaoId?: string
    status: string
    erro?: string
  }> {
    console.log(`[Pix Strategy] Gerando Pix para o pagamento no valor de R$ ${pagamento.valor}...`);
    // simulando geracao e aprovacao imediata do Pix
    const transacaoId = `pix_tx_${Math.random().toString(36).substring(2, 11)}`;
    return {
      sucesso: true,
      transacaoId,
      status: 'APROVADO'
    }
  }
}
