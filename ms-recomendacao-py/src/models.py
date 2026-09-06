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
    __tablename__ = "restaurantes_replica"

    # Não usamos autoincrement porque vamos copiar do ID do banco de dados principal (Postgres principal)
    id = Column(Integer, primary_key=True, autoincrement=False)
    nome = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    plano = Column(String(50), default="GRATUITO", nullable=False)


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
    __tablename__ = "vendas_produtos_analise"

    id = Column(Integer, primary_key=True, index=True)
    pedido_id = Column(Integer, index=True, nullable=False)
    produto_id = Column(Integer, index=True, nullable=False)
    restaurante_id = Column(Integer, index=True, nullable=False)
    preco_unitario = Column(Float, nullable=False)
    quantidade = Column(Integer, nullable=False)
    data_criacao = Column(DateTime, default=get_utc_now, nullable=False)

