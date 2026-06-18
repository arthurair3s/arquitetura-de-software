import type { IRecomendacaoProvider, InsightsLojaDTO, AssinaturaDTO } from '../../domain/ports/IRecomendacaoProvider.js';
import type { IRecomendacaoService } from '../ports/IRecomendacaoService.js';

export class RecomendacaoAppService implements IRecomendacaoService {
  constructor(private readonly provider: IRecomendacaoProvider) {}

  async obterInsights(restauranteId: number): Promise<InsightsLojaDTO> {
    return this.provider.obterInsights(restauranteId);
  }

  async atualizarAssinatura(restauranteId: number, plano: string): Promise<AssinaturaDTO> {
    return this.provider.atualizarAssinatura(restauranteId, plano);
  }
}
