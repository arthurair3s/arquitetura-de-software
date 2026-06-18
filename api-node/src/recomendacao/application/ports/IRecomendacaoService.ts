import { InsightsLojaDTO, AssinaturaDTO } from '../../domain/ports/IRecomendacaoProvider.js';

export interface IRecomendacaoService {
  obterInsights(restauranteId: number): Promise<InsightsLojaDTO>;
  atualizarAssinatura(restauranteId: number, plano: string): Promise<AssinaturaDTO>;
}
