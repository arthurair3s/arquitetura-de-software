import { diContainer } from '../../../shared/infrastructure/container.js';

export const createRecomendacaoMutation = () => ({
  atualizarAssinaturaRecomendacao: async (_: any, { restauranteId, plano }: { restauranteId: number, plano: string }) => {
    const useCase = diContainer.getAssinarPlanoRecomendacaoUseCase();
    return useCase.execute(restauranteId, plano);
  }
});
