import type { IRecomendacaoProvider, AssinaturaDTO } from '../../domain/ports/IRecomendacaoProvider.js';

export class AssinarPlanoRecomendacaoUseCase {
  constructor(private readonly provider: IRecomendacaoProvider) {}

  async execute(restauranteId: number, plano: string): Promise<AssinaturaDTO> {
    return this.provider.atualizarAssinatura(restauranteId, plano);
  }
}
