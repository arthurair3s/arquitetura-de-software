# pyrefly: ignore [untyped-import]
import grpc
from concurrent import futures
import time
import os

# pyrefly: ignore [missing-import]
import recomendacao_pb2
# pyrefly: ignore [missing-import]
import recomendacao_pb2_grpc

from database import get_db
from services.recommendation_service import RecommendationService
from models import RestauranteReplica, AssinaturaRestaurante

# pyrefly: ignore [missing-import]
class RecomendacaoServiceServicer(recomendacao_pb2_grpc.RecomendacaoServiceServicer):
    def __init__(self):
        self.recommendation_service = RecommendationService()

    def ObterInsightsLoja(self, request, context):
        print(f"[gRPC-Server] ObterInsightsLoja chamado para restaurante #{request.restaurante_id}")
        db = next(get_db())
        try:
            insights_data = self.recommendation_service.get_store_recommendations(
                db=db,
                restaurante_id=request.restaurante_id
            )

            # Mapear para o proto response
            status = insights_data.get("status", "ERROR")
            plano = insights_data.get("plano", "GRATUITO")
            restaurante_nome = insights_data.get("restaurante", "")
            concorrentes_analisados = insights_data.get("concorrentes_analisados", 0)

            insights_list = []
            for item in insights_data.get("insights", []):
                # pyrefly: ignore [missing-attribute]
                insight_item = recomendacao_pb2.InsightItem(
                    produto_id=item.get("produto_id", 0),
                    produto_nome=item.get("produto_nome", ""),
                    preco_atual=float(item.get("preco_atual", 0.0)),
                    tipo_sugestao=item.get("tipo_sugestao", ""),
                    sugestao=item.get("sugestao", "")
                )
                insights_list.append(insight_item)

            # pyrefly: ignore [missing-attribute]
            return recomendacao_pb2.InsightsResponse(
                status=status,
                plano=plano,
                restaurante=restaurante_nome,
                concorrentes_analisados=concorrentes_analisados,
                insights=insights_list
            )
        except Exception as e:
            print(f"[gRPC-Server] Erro ao obter insights: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            # pyrefly: ignore [missing-attribute]
            return recomendacao_pb2.InsightsResponse(status="ERROR")
        finally:
            db.close()

    def AtualizarAssinatura(self, request, context):
        print(f"[gRPC-Server] AtualizarAssinatura chamado para restaurante #{request.restaurante_id} - Plano: {request.plano}")
        plano_upper = request.plano.upper()
        if plano_upper not in ["PREMIUM", "GRATUITO"]:
            context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
            context.set_details("Plano inválido. Use 'PREMIUM' ou 'GRATUITO'")
            # pyrefly: ignore [missing-attribute]
            return recomendacao_pb2.AssinaturaResponse()

        db = next(get_db())
        try:
            restaurante = db.query(RestauranteReplica).filter(RestauranteReplica.id == request.restaurante_id).first()
            if not restaurante:
                context.set_code(grpc.StatusCode.NOT_FOUND)
                context.set_details("Restaurante não encontrado.")
                # pyrefly: ignore [missing-attribute]
                return recomendacao_pb2.AssinaturaResponse()

            # A assinatura é estado próprio: mora fora da réplica para sobreviver
            # a um rebuild do CDC. Ver models.AssinaturaRestaurante.
            assinatura = db.query(AssinaturaRestaurante).filter(
                AssinaturaRestaurante.restaurante_id == request.restaurante_id
            ).first()
            if assinatura:
                assinatura.plano = plano_upper
            else:
                db.add(AssinaturaRestaurante(restaurante_id=request.restaurante_id, plano=plano_upper))
            db.commit()
            print(f"[gRPC-Server] Plano do restaurante #{request.restaurante_id} alterado para {plano_upper}.")
            
            # pyrefly: ignore [missing-attribute]
            return recomendacao_pb2.AssinaturaResponse(
                restaurante_id=request.restaurante_id,
                plano=plano_upper,
                message=f"Assinatura do restaurante atualizada para {plano_upper} com sucesso via gRPC."
            )
        except Exception as e:
            db.rollback()
            print(f"[gRPC-Server] Erro ao atualizar assinatura: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            # pyrefly: ignore [missing-attribute]
            return recomendacao_pb2.AssinaturaResponse()
        finally:
            db.close()


def start_grpc_server(port="50053"):
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    # pyrefly: ignore [missing-import]
    recomendacao_pb2_grpc.add_RecomendacaoServiceServicer_to_server(
        RecomendacaoServiceServicer(), server
    )
    server.add_insecure_port(f"0.0.0.0:{port}")
    server.start()
    print(f"[gRPC-Server] Servidor gRPC ativo na porta {port}")
    try:
        while True:
            time.sleep(86400)
    except KeyboardInterrupt:
        server.stop(0)
