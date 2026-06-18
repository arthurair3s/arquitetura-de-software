import type { IRecomendacaoService } from '../../application/ports/IRecomendacaoService.js';

export const createRecomendacaoQuery = (service: IRecomendacaoService) => ({
  obterInsightsLoja: async (_: any, { restauranteId }: { restauranteId: number }) => {
    return service.obterInsights(restauranteId);
  }
});
