import time
import json
# pyrefly: ignore [missing-import]
import pika
# pyrefly: ignore [missing-import]
from pika.exceptions import AMQPConnectionError
from config import Config
from database import SessionLocal
from models import HistoricoPedido, ProdutoReplica, VendaProdutoAnalise, RestauranteReplica, CategoriaReplica
from datetime import datetime, timezone
import random


class RabbitMQConsumer:
    def __init__(self):
        self.exchange_name = "delivery-events"
        self.queue_name = "recomendacao.pedidos"
        self.catalog_queue_name = "recomendacao.catalog"
        self.dlx_exchange_name = "delivery-events.dlx"
        self.dlq_queue_name = "recomendacao.pedidos.dlq"
        self.dlq_routing_key = "dlq.recomendacao.pedidos"
        self.catalog_dlq_queue_name = "recomendacao.catalog.dlq"
        self.catalog_dlq_routing_key = "dlq.recomendacao.catalog"
        self.connection = None
        self.channel = None

    def connect_with_retry(self):
        if Config.RABBIT_URL:
            parameters = pika.URLParameters(Config.RABBIT_URL)
            parameters.heartbeat = 600
            parameters.blocked_connection_timeout = 300
        else:
            credentials = pika.PlainCredentials(Config.RABBIT_USER, Config.RABBIT_PASS)
            parameters = pika.ConnectionParameters(
                host=Config.RABBIT_HOST,
                port=Config.RABBIT_PORT,
                credentials=credentials,
                heartbeat=600,
                blocked_connection_timeout=300
            )

        while True:
            try:
                if Config.RABBIT_URL:
                    print("[Consumer] Conectando ao RabbitMQ usando URL...")
                else:
                    print(f"[Consumer] Conectando ao RabbitMQ em {Config.RABBIT_HOST}:{Config.RABBIT_PORT}...")
                self.connection = pika.BlockingConnection(parameters)
                self.channel = self.connection.channel()

                # Declarar exchange
                self.channel.exchange_declare(exchange=self.exchange_name, exchange_type="topic", durable=True)

                # --- Dead Letter Exchange compartilhada, com uma DLQ por fila ---
                # A routing key explícita é o que mantém os dead letters separados:
                # sem ela cada DLQ receberia as mensagens rejeitadas de todas as filas.
                self.channel.exchange_declare(exchange=self.dlx_exchange_name, exchange_type="topic", durable=True)

                self.channel.queue_declare(queue=self.dlq_queue_name, durable=True)
                self.channel.queue_bind(exchange=self.dlx_exchange_name, queue=self.dlq_queue_name, routing_key=self.dlq_routing_key)

                self.channel.queue_declare(queue=self.catalog_dlq_queue_name, durable=True)
                self.channel.queue_bind(exchange=self.dlx_exchange_name, queue=self.catalog_dlq_queue_name, routing_key=self.catalog_dlq_routing_key)

                # --- Fila de pedidos ---
                self.channel.queue_declare(queue=self.queue_name, durable=True, arguments={
                    "x-dead-letter-exchange": self.dlx_exchange_name,
                    "x-dead-letter-routing-key": self.dlq_routing_key,
                })
                self.channel.queue_bind(exchange=self.exchange_name, queue=self.queue_name, routing_key="pedido.confirmado")

                # --- Fila de catálogo (Outbox Pattern — substitui Debezium CDC) ---
                self.channel.queue_declare(queue=self.catalog_queue_name, durable=True, arguments={
                    "x-dead-letter-exchange": self.dlx_exchange_name,
                    "x-dead-letter-routing-key": self.catalog_dlq_routing_key,
                })
                for routing_key in [
                    "restaurante.created", "restaurante.updated", "restaurante.deleted",
                    "categoria.created",   "categoria.updated",   "categoria.deleted",
                    "produto.created",     "produto.updated",     "produto.deleted",
                ]:
                    self.channel.queue_bind(exchange=self.exchange_name, queue=self.catalog_queue_name, routing_key=routing_key)

                print(f"[Consumer] Conectado. Escutando filas '{self.queue_name}' e '{self.catalog_queue_name}'...")
                break
            except AMQPConnectionError as e:
                print(f"[Consumer] Conexão falhou. Tentando novamente em 5s... Erro: {e}")
                time.sleep(5)

    def process_message(self, ch, method, properties, body):
        routing_key = method.routing_key
        try:
            payload = json.loads(body.decode("utf-8"))

            if routing_key == "pedido.confirmado":
                print(f"[Consumer] Evento recebido '{routing_key}' — Pedido #{payload.get('id')}")
                self._save_order_history(payload)
            elif routing_key.startswith("restaurante."):
                print(f"[Consumer] Outbox CDC: '{routing_key}'")
                self._handle_restaurante(payload)
            elif routing_key.startswith("categoria."):
                print(f"[Consumer] Outbox CDC: '{routing_key}'")
                self._handle_categoria(payload)
            elif routing_key.startswith("produto."):
                print(f"[Consumer] Outbox CDC: '{routing_key}'")
                self._handle_produto(payload)

            ch.basic_ack(delivery_tag=method.delivery_tag)
        except Exception as e:
            dlq = self.catalog_dlq_queue_name if routing_key and not routing_key.startswith("pedido.") else self.dlq_queue_name
            print(f"[Consumer] Erro ao processar '{routing_key}': {e}. Enviando para a DLQ '{dlq}'.")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

    # ──────────────────────────────────────────────
    # Handlers de Catálogo (Outbox Pattern)
    # Equivalentes aos handlers do antigo kafka_consumer.py
    # ──────────────────────────────────────────────

    def _handle_restaurante(self, payload: dict):
        op = payload.get("op")
        after = payload.get("after", {})
        before = payload.get("before", {})
        db = SessionLocal()
        try:
            if op in ["c", "u"]:
                rest_id = after.get("id")
                rest = db.query(RestauranteReplica).filter(RestauranteReplica.id == rest_id).first()
                if rest:
                    rest.nome = after.get("nome", rest.nome)
                    rest.latitude = after.get("latitude", rest.latitude)
                    rest.longitude = after.get("longitude", rest.longitude)
                    print(f"[Consumer] Restaurante #{rest_id} atualizado na réplica.")
                else:
                    db.add(RestauranteReplica(
                        id=rest_id, nome=after.get("nome"),
                        latitude=after.get("latitude"), longitude=after.get("longitude"),
                        plano="GRATUITO"
                    ))
                    print(f"[Consumer] Restaurante #{rest_id} criado na réplica.")
            elif op == "d":
                rest_id = before.get("id")
                rest = db.query(RestauranteReplica).filter(RestauranteReplica.id == rest_id).first()
                if rest:
                    db.delete(rest)
                    print(f"[Consumer] Restaurante #{rest_id} removido da réplica.")
            db.commit()
        except Exception as e:
            db.rollback()
            print(f"[Consumer] Erro ao replicar restaurante: {e}")
        finally:
            db.close()

    def _handle_categoria(self, payload: dict):
        op = payload.get("op")
        after = payload.get("after", {})
        before = payload.get("before", {})
        db = SessionLocal()
        try:
            if op in ["c", "u"]:
                cat_id = after.get("id")
                rest_id = after.get("restaurante_id") or after.get("restauranteId")
                cat = db.query(CategoriaReplica).filter(CategoriaReplica.id == cat_id).first()
                if cat:
                    cat.nome = after.get("nome", cat.nome)
                    cat.restaurante_id = rest_id or cat.restaurante_id
                    print(f"[Consumer] Categoria #{cat_id} atualizada na réplica.")
                else:
                    db.add(CategoriaReplica(id=cat_id, nome=after.get("nome"), restaurante_id=rest_id))
                    print(f"[Consumer] Categoria #{cat_id} criada na réplica.")
                # Corrige produtos out-of-order sem restaurante_id
                if rest_id:
                    pendentes = db.query(ProdutoReplica).filter(
                        ProdutoReplica.categoria_id == cat_id,
                        ProdutoReplica.restaurante_id == 0
                    ).all()
                    for p in pendentes:
                        p.restaurante_id = rest_id
            elif op == "d":
                cat_id = before.get("id")
                cat = db.query(CategoriaReplica).filter(CategoriaReplica.id == cat_id).first()
                if cat:
                    db.delete(cat)
                    print(f"[Consumer] Categoria #{cat_id} removida da réplica.")
            db.commit()
        except Exception as e:
            db.rollback()
            print(f"[Consumer] Erro ao replicar categoria: {e}")
        finally:
            db.close()

    def _handle_produto(self, payload: dict):
        op = payload.get("op")
        after = payload.get("after", {})
        before = payload.get("before", {})
        db = SessionLocal()
        try:
            if op in ["c", "u"]:
                prod_id = after.get("id")
                cat_id = after.get("categoria_id") or after.get("categoriaId")
                restaurante_id = 0
                if cat_id:
                    cat = db.query(CategoriaReplica).filter(CategoriaReplica.id == cat_id).first()
                    if cat:
                        restaurante_id = cat.restaurante_id
                prod = db.query(ProdutoReplica).filter(ProdutoReplica.id == prod_id).first()
                if prod:
                    prod.nome = after.get("nome", prod.nome)
                    prod.preco = after.get("preco", prod.preco)
                    prod.categoria_id = cat_id or prod.categoria_id
                    prod.restaurante_id = restaurante_id or prod.restaurante_id
                    print(f"[Consumer] Produto #{prod_id} atualizado na réplica.")
                else:
                    db.add(ProdutoReplica(
                        id=prod_id, nome=after.get("nome"), preco=after.get("preco"),
                        categoria_id=cat_id, restaurante_id=restaurante_id
                    ))
                    print(f"[Consumer] Produto #{prod_id} criado na réplica.")
            elif op == "d":
                prod_id = before.get("id")
                prod = db.query(ProdutoReplica).filter(ProdutoReplica.id == prod_id).first()
                if prod:
                    db.delete(prod)
                    print(f"[Consumer] Produto #{prod_id} removido da réplica.")
            db.commit()
        except Exception as e:
            db.rollback()
            print(f"[Consumer] Erro ao replicar produto: {e}")
        finally:
            db.close()

    def _save_order_history(self, payload: dict):
        db = SessionLocal()
        try:
            pedido_id = payload.get("id")
            restaurante_id = payload.get("restaurante_id")
            if not pedido_id or not restaurante_id:
                print("[Consumer] Evento sem ID de pedido ou restaurante. Abortando gravação.")
                return

            # Verificar se já existe histórico para esse pedido
            existente = db.query(HistoricoPedido).filter(HistoricoPedido.pedido_id == pedido_id).first()
            if existente:
                print(f"[Consumer] Histórico do pedido #{pedido_id} já existe. Ignorando.")
                return

            # Conversão de data
            data_str = payload.get("data_criacao")
            data_criacao = datetime.now(timezone.utc)
            if data_str:
                try:
                    # Converte do ISO NodeJS (ex: 2026-06-17T17:20:51.000Z)
                    data_str_cleaned = data_str.replace("Z", "+00:00")
                    data_criacao = datetime.fromisoformat(data_str_cleaned)
                except Exception as ex:
                    print(f"[Consumer] Erro ao parsear data_criacao ({data_str}): {ex}. Usando data atual.")

            historico = HistoricoPedido(
                pedido_id=pedido_id,
                usuario_id=payload.get("usuario_id"),
                restaurante_id=restaurante_id,
                valor_total=float(payload.get("valor_total", 0)),
                destino_latitude=float(payload.get("destino_latitude", 0)),
                destino_longitude=float(payload.get("destino_longitude", 0)),
                data_criacao=data_criacao
            )
            db.add(historico)

            # Simular itens de pedido vendidos para fins analíticos B2B
            # Busca produtos vinculados à réplica do restaurante
            produtos = db.query(ProdutoReplica).filter(ProdutoReplica.restaurante_id == restaurante_id).all()
            
            # Fallback robusto se produtos_replica estiver vazia antes do Kafka CDC (Stage 4)
            if not produtos:
                print(f"[Consumer] Nenhum produto réplica encontrado para restaurante #{restaurante_id}. Simulando produto analítico.")
                # Vamos associar um produto analítico mockado com base no nome do restaurante
                produto_mock_id = 9000 + restaurante_id
                produto_mock = ProdutoReplica(
                    id=produto_mock_id,
                    nome="Hambúrguer Artesanal Supremo" if restaurante_id in [4, 3] else "Combinado Especial",
                    preco=32.90 if restaurante_id in [4, 3] else 49.90,
                    categoria_id=4 if restaurante_id in [4, 3] else 2,
                    restaurante_id=restaurante_id
                )
                db.add(produto_mock)
                db.flush()
                produtos = [produto_mock]

            # Escolhe entre 1 e 2 produtos do restaurante para simular a venda
            produtos_vendidos = random.sample(produtos, min(len(produtos), 2))
            for produto in produtos_vendidos:
                quantidade = random.randint(1, 2)
                venda_item = VendaProdutoAnalise(
                    pedido_id=pedido_id,
                    produto_id=produto.id,
                    restaurante_id=restaurante_id,
                    preco_unitario=produto.preco,
                    quantidade=quantidade,
                    data_criacao=data_criacao
                )
                db.add(venda_item)
                print(f"[Consumer] Simulou venda analítica: {quantidade}x '{produto.nome}' (ID {produto.id}) no pedido #{pedido_id}.")

            db.commit()
            print(f"[Consumer] Histórico analítico e vendas do pedido #{pedido_id} salvos com sucesso.")
        except Exception as e:
            db.rollback()
            print(f"[Consumer] Erro ao gravar histórico e vendas no banco: {e}")
        finally:
            db.close()


    def start(self):
        while True:
            try:
                self.connect_with_retry()
                if self.channel is not None:
                    # Consome fila de pedidos e fila de catálogo (Outbox Pattern)
                    self.channel.basic_consume(queue=self.queue_name, on_message_callback=self.process_message, auto_ack=False)
                    self.channel.basic_consume(queue=self.catalog_queue_name, on_message_callback=self.process_message, auto_ack=False)
                    self.channel.start_consuming()
            except AMQPConnectionError:
                print("[Consumer] Conexão perdida. Reconectando...")
            except KeyboardInterrupt:
                print("[Consumer] Encerrando...")
                self.stop()
                break
            except Exception as e:
                print(f"[Consumer] Erro inesperado: {e}. Reconectando em 5s...")
                time.sleep(5)

    def stop(self):
        if self.connection and not self.connection.is_closed:
            self.connection.close()
