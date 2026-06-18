import recomendacaoClient from '../../../grpc/recomendacaoClient.js';
import type { IRecomendacaoProvider, InsightsLojaDTO, AssinaturaDTO } from '../../domain/ports/IRecomendacaoProvider.js';

export class GrpcRecomendacaoProvider implements IRecomendacaoProvider {
  obterInsights(restauranteId: number): Promise<InsightsLojaDTO> {
    return new Promise((resolve, reject) => {
      recomendacaoClient.ObterInsightsLoja({ restaurante_id: restauranteId }, (error, response) => {
        if (error) {
          console.error('[gRPC-Client] Erro ao buscar insights:', error);
          return reject(error);
        }

        // Mapear snake_case do proto para camelCase do DTO
        const insightsList = (response.insights || []).map(item => ({
          produtoId: item.produto_id,
          produtoNome: item.produto_nome,
          precoAtual: item.preco_atual,
          tipoSugestao: item.tipo_sugestao,
          sugestao: item.sugestao
        }));

        resolve({
          status: response.status,
          plano: response.plano,
          restaurante: response.restaurante,
          concorrentesAnalisados: response.concorrentes_analisados,
          insights: insightsList
        });
      });
    });
  }

  atualizarAssinatura(restauranteId: number, plano: string): Promise<AssinaturaDTO> {
    return new Promise((resolve, reject) => {
      recomendacaoClient.AtualizarAssinatura({ restaurante_id: restauranteId, plano }, (error, response) => {
        if (error) {
          console.error('[gRPC-Client] Erro ao atualizar assinatura:', error);
          return reject(error);
        }

        resolve({
          restauranteId: response.restaurante_id,
          plano: response.plano,
          message: response.message
        });
      });
    });
  }
}
