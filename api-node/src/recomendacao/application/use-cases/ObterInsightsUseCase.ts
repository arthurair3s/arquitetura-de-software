import type { IRecomendacaoProvider, InsightsLojaDTO } from '../../domain/ports/IRecomendacaoProvider.js'

export class ObterInsightsUseCase {
  constructor(private readonly provider: IRecomendacaoProvider) {}

  async execute(restauranteId: number): Promise<InsightsLojaDTO> {
    return this.provider.obterInsights(restauranteId)
  }
}
