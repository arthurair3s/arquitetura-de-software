import { diContainer } from '../../../shared/infrastructure/container.js';

export const createRecomendacaoQuery = () => ({
  obterInsightsLoja: async (_: any, { restauranteId }: { restauranteId: number }) => {
    const useCase = diContainer.getObterInsightsUseCase();
    return useCase.execute(restauranteId);
  }
});
