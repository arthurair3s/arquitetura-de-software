export interface InsightItemDTO {
  produtoId: number;
  produtoNome: string;
  precoAtual: number;
  tipoSugestao: string;
  sugestao: string;
}

export interface InsightsLojaDTO {
  status: string;
  plano: string;
  restaurante: string;
  concorrentesAnalisados: number;
  insights: InsightItemDTO[];
}

export interface AssinaturaDTO {
  restauranteId: number;
  plano: string;
  message: string;
}

export interface IRecomendacaoProvider {
  obterInsights(restauranteId: number): Promise<InsightsLojaDTO>;
  atualizarAssinatura(restauranteId: number, plano: string): Promise<AssinaturaDTO>;
}
