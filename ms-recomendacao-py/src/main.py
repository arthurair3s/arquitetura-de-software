import threading
import os
from contextlib import asynccontextmanager
# pyrefly: ignore [missing-import]
from opentelemetry import trace
# pyrefly: ignore [missing-import]
from opentelemetry.sdk.trace import TracerProvider
# pyrefly: ignore [missing-import]
from opentelemetry.sdk.trace.export import BatchSpanProcessor
# pyrefly: ignore [missing-import]
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
# pyrefly: ignore [missing-import]
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
# pyrefly: ignore [missing-import]
from opentelemetry.sdk.resources import Resource


# inicializa o opentelemetry provider e exportador otlp grpc
otel_endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4317")
otel_service_name = os.getenv("OTEL_SERVICE_NAME", "ms-recomendacao")

resource = Resource.create(attributes={"service.name": otel_service_name})
provider = TracerProvider(resource=resource)
processor = BatchSpanProcessor(OTLPSpanExporter(endpoint=otel_endpoint, insecure=True))
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)

# pyrefly: ignore [missing-import]
from fastapi import FastAPI, Depends, HTTPException, Query
# pyrefly: ignore [missing-import]
from pydantic import BaseModel
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from database import engine, Base, get_db
# pyrefly: ignore [missing-import]
from models import RestauranteReplica, ProdutoReplica
from messaging.consumer import RabbitMQConsumer
from services.recommendation_service import RecommendationService

# garante a criação de tabelas do banco de dados na inicialização
Base.metadata.create_all(bind=engine)

consumer = RabbitMQConsumer()
recommendation_service = RecommendationService()


def seed_initial_replicas():
    """Auto-seeda restaurantes e produtos para que os testes de insights funcionem perfeitamente."""
    db = next(get_db())
    try:
        count_rest = db.query(RestauranteReplica).count()
        if count_rest == 0:
            print("[Main] Alimentando restaurantes_replica com dados iniciais...")
            initial_restaurants = [
                RestauranteReplica(id=1, nome="Pizzaria Cachambi", latitude=-22.8861, longitude=-43.2778, plano="GRATUITO"),
                RestauranteReplica(id=2, nome="Sushi Maria da Graça", latitude=-22.8767, longitude=-43.2721, plano="GRATUITO"),
                RestauranteReplica(id=3, nome="Lanchonete Bonsucesso", latitude=-22.8631, longitude=-43.2554, plano="GRATUITO"),
                RestauranteReplica(id=4, nome="Braga's Burger", latitude=-22.877022, longitude=-43.256681, plano="GRATUITO"),
                RestauranteReplica(id=5, nome="Seafood Copacabana", latitude=-22.9711, longitude=-43.1822, plano="GRATUITO"),
                RestauranteReplica(id=6, nome="Executivo do Centro", latitude=-22.9035, longitude=-43.173, plano="GRATUITO"),
                RestauranteReplica(id=7, nome="Steakhouse da Barra", latitude=-23.0003, longitude=-43.3658, plano="GRATUITO"),
            ]
            db.bulk_save_objects(initial_restaurants)
            db.commit()
            print("[Main] Auto-seed de restaurantes concluído.")

        count_prod = db.query(ProdutoReplica).count()
        if count_prod == 0:
            print("[Main] Alimentando produtos_replica com dados iniciais...")
            initial_products = [
                ProdutoReplica(id=1, nome="Pizza Margherita", preco=45.0, categoria_id=1, restaurante_id=1),
                ProdutoReplica(id=2, nome="Pizza Pepperoni", preco=52.0, categoria_id=1, restaurante_id=1),
                ProdutoReplica(id=3, nome="Combinado ZN", preco=49.9, categoria_id=2, restaurante_id=2),
                ProdutoReplica(id=4, nome="Temaki Salmão", preco=22.9, categoria_id=2, restaurante_id=2),
                ProdutoReplica(id=5, nome="Sanduíche X-Tudo", preco=25.0, categoria_id=3, restaurante_id=3),
                ProdutoReplica(id=6, nome="Batata com Cheddar", preco=18.0, categoria_id=3, restaurante_id=3),
                ProdutoReplica(id=7, nome="Classic Burger", preco=32.9, categoria_id=4, restaurante_id=4),
                ProdutoReplica(id=8, nome="Double Smash", preco=42.9, categoria_id=4, restaurante_id=4),
                ProdutoReplica(id=9, nome="Prato Feito Camarão", preco=65.0, categoria_id=5, restaurante_id=5),
                ProdutoReplica(id=10, nome="Ceviche Fresco", preco=45.0, categoria_id=5, restaurante_id=5),
                ProdutoReplica(id=11, nome="Bife a Cavalo", preco=35.0, categoria_id=6, restaurante_id=6),
                ProdutoReplica(id=12, nome="Frango Empanado", preco=32.0, categoria_id=6, restaurante_id=6),
                ProdutoReplica(id=13, nome="Picanha Angus 500g", preco=150.0, categoria_id=7, restaurante_id=7),
                ProdutoReplica(id=14, nome="Bife Ancho", preco=120.0, categoria_id=7, restaurante_id=7),
            ]
            db.bulk_save_objects(initial_products)
            db.commit()
            print("[Main] Auto-seed de produtos concluído.")
    except Exception as e:
        db.rollback()
        print(f"[Main] Erro ao realizar auto-seed: {e}")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # executa o auto-seed dos restaurantes e produtos
    seed_initial_replicas()

    # inicia o consumer RabbitMQ em uma thread separada
    consumer_thread = threading.Thread(target=consumer.start, daemon=True)
    consumer_thread.start()
    print("[Main] Consumer do RabbitMQ iniciado em background.")

    # inicia o servidor gRPC em background
    # pyrefly: ignore [missing-import]
    from grpc_server import start_grpc_server
    grpc_thread = threading.Thread(target=start_grpc_server, daemon=True)
    grpc_thread.start()
    print("[Main] Servidor gRPC iniciado em background na porta 50053.")
    yield
    print("[Main] Parando consumer RabbitMQ...")
    consumer.stop()



app = FastAPI(
    title="MS Recomendacao B2B (Python)",
    description="Motor de inteligência competitiva e precificação inteligente para restaurantes",
    version="1.0.0",
    lifespan=lifespan
)

# instrumenta o app fastapi para gerar traces automáticos
FastAPIInstrumentor.instrument_app(app)


class AssinaturaRequest(BaseModel):
    restaurante_id: int
    plano: str  # PREMIUM ou GRATUITO


@app.get("/health")
def health_check():
    return {"status": "UP", "service": "ms-recomendacao"}


@app.get("/recomendacoes/lojas")
def get_store_insights(
    restaurante_id: int = Query(..., description="ID da loja/restaurante para geração de insights"),
    db: Session = Depends(get_db)
):
    """Retorna insights competitivos de preço e sugestões promocionais baseados no plano da loja (Strategy Pattern)."""
    try:
        insights = recommendation_service.get_store_recommendations(
            db=db,
            restaurante_id=restaurante_id
        )
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno no motor analítico B2B: {e}")


@app.post("/assinaturas")
def atualizar_plano(
    request: AssinaturaRequest,
    db: Session = Depends(get_db)
):
    """Atualiza o plano comercial de um restaurante (simulando ativação da assinatura)."""
    plano_upper = request.plano.upper()
    if plano_upper not in ["PREMIUM", "GRATUITO"]:
        raise HTTPException(status_code=400, detail="Plano inválido. Use 'PREMIUM' ou 'GRATUITO'")

    restaurante = db.query(RestauranteReplica).filter(RestauranteReplica.id == request.restaurante_id).first()
    if not restaurante:
        raise HTTPException(status_code=404, detail="Restaurante não encontrado no banco de recomendações.")

    # pyrefly: ignore [bad-assignment]
    restaurante.plano = plano_upper
    db.commit()
    print(f"[Main] Plano do restaurante #{request.restaurante_id} alterado para {plano_upper}.")
    return {
        "restaurante_id": request.restaurante_id,
        "plano": plano_upper,
        "message": f"Assinatura do restaurante atualizada para {plano_upper} com sucesso."
    }


if __name__ == "__main__":
    # pyrefly: ignore [missing-import]
    import uvicorn
    # executa o servidor na porta 8001
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=False)
