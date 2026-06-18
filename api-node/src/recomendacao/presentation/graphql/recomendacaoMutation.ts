import type { IRecomendacaoService } from '../../application/ports/IRecomendacaoService.js';

export const createRecomendacaoMutation = (service: IRecomendacaoService) => ({
  atualizarAssinaturaRecomendacao: async (_: any, { restauranteId, plano }: { restauranteId: number, plano: string }) => {
    return service.atualizarAssinatura(restauranteId, plano);
  }
});
