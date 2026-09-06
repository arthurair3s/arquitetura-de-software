# pyrefly: ignore [missing-import]
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from database import Base
import datetime


def get_utc_now():
    return datetime.datetime.now(datetime.timezone.utc)


class HistoricoPedido(Base):
    __tablename__ = "historico_pedidos"

    id = Column(Integer, primary_key=True, index=True)
    pedido_id = Column(Integer, unique=True, index=True, nullable=False)
    usuario_id = Column(Integer, index=True, nullable=False)
    restaurante_id = Column(Integer, index=True, nullable=False)
    valor_total = Column(Float, nullable=False)
    destino_latitude = Column(Float, nullable=False)
    destino_longitude = Column(Float, nullable=False)
    data_criacao = Column(DateTime, default=get_utc_now, nullable=False)


class RestauranteReplica(Base):
    """Estado derivado: espelho do banco principal, reconstruível pelo CDC."""
    __tablename__ = "restaurantes_replica"

    # Não usamos autoincrement porque vamos copiar do ID do banco de dados principal (Postgres principal)
    id = Column(Integer, primary_key=True, autoincrement=False)
    nome = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)


class CategoriaReplica(Base):
    __tablename__ = "categorias_replica"

    id = Column(Integer, primary_key=True, autoincrement=False)
    nome = Column(String(100), nullable=False)
    restaurante_id = Column(Integer, index=True, nullable=False)


class ProdutoReplica(Base):
    __tablename__ = "produtos_replica"

    id = Column(Integer, primary_key=True, autoincrement=False)
    nome = Column(String(255), nullable=False)
    preco = Column(Float, nullable=False)
    categoria_id = Column(Integer, index=True, nullable=False)
    restaurante_id = Column(Integer, index=True, nullable=False)


class VendaProdutoAnalise(Base):
    """
    Uma linha por item de pedido, replicada do banco principal via CDC.

    item_pedido_id é a chave natural da origem e está marcada como unique: é ela
    que torna o consumo idempotente. O Debezium entrega at-least-once, então
    reprocessar o tópico — em rebalance, restart ou replay desde o offset zero —
    tem que convergir para o mesmo estado, não duplicar vendas.
    """
    __tablename__ = "vendas_produtos_analise"

    id = Column(Integer, primary_key=True, index=True)
    item_pedido_id = Column(Integer, unique=True, index=True, nullable=False)
    pedido_id = Column(Integer, index=True, nullable=False)
    produto_id = Column(Integer, index=True, nullable=False)
    restaurante_id = Column(Integer, index=True, nullable=False)
    preco_unitario = Column(Float, nullable=False)
    quantidade = Column(Integer, nullable=False)
    data_criacao = Column(DateTime, default=get_utc_now, nullable=False)



# ─────────────────────────────────────────────────────────────────────────────
# estado PRÓPRIO deste serviço — não vem do CDC e não é descartado num rebuild.
# ─────────────────────────────────────────────────────────────────────────────

class AssinaturaRestaurante(Base):
    """
    Plano comercial contratado pelo restaurante.

    Vive fora de RestauranteReplica de propósito. A réplica é estado derivado e
    pode ser jogada fora e reconstruída a partir do tópico Kafka; a assinatura é
    dado que só existe aqui, e um rebuild não pode apagá-la. Misturar as duas
    coisas na mesma tabela transformaria uma operação rotineira em perda de dado.
    """
    __tablename__ = "assinaturas_restaurante"

    restaurante_id = Column(Integer, primary_key=True, autoincrement=False)
    plano = Column(String(50), default="GRATUITO", nullable=False)
    atualizado_em = Column(DateTime, default=get_utc_now, nullable=False)


# tabelas que o CDC reconstrói. Usado pelo rebuild de schema no boot.
TABELAS_DERIVADAS = [
    RestauranteReplica.__table__,
    CategoriaReplica.__table__,
    ProdutoReplica.__table__,
    HistoricoPedido.__table__,
    VendaProdutoAnalise.__table__,
]


class MetadadoReplica(Base):
    """Guarda a versão do schema da réplica, para detectar quando reconstruir."""
    __tablename__ = "metadados_replica"

    chave = Column(String(50), primary_key=True)
    valor = Column(String(255), nullable=False)
