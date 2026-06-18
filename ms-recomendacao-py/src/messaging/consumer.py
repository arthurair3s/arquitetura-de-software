import time
import json
# pyrefly: ignore [missing-import]
import pika
# pyrefly: ignore [missing-import]
from pika.exceptions import AMQPConnectionError
from config import Config
from database import SessionLocal
from models import HistoricoPedido, ProdutoReplica, VendaProdutoAnalise
from datetime import datetime, timezone
import random


class RabbitMQConsumer:
    def __init__(self):
        self.exchange_name = "delivery-events"
        self.queue_name = "recomendacao.pedidos"
        self.connection = None
        self.channel = None

    def connect_with_retry(self):
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
                print(f"[Consumer] Conectando ao RabbitMQ em {Config.RABBIT_HOST}:{Config.RABBIT_PORT}...")
                self.connection = pika.BlockingConnection(parameters)
                self.channel = self.connection.channel()

                # Declarar exchange
                self.channel.exchange_declare(exchange=self.exchange_name, exchange_type="topic", durable=True)

                # Declarar fila
                self.channel.queue_declare(queue=self.queue_name, durable=True)

                # Bind para o evento pedido.confirmado
                self.channel.queue_bind(exchange=self.exchange_name, queue=self.queue_name, routing_key="pedido.confirmado")

                print(f"[Consumer] Conectado e escutando a fila '{self.queue_name}'...")
                break
            except AMQPConnectionError as e:
                print(f"[Consumer] Conexão falhou. Tentando novamente em 5s... Erro: {e}")
                time.sleep(5)

    def process_message(self, ch, method, properties, body):
        routing_key = method.routing_key
        try:
            payload = json.loads(body.decode("utf-8"))
            print(f"[Consumer] Evento recebido '{routing_key}' no MS Recomendação — Pedido #{payload.get('id')}")

            if routing_key == "pedido.confirmado":
                self._save_order_history(payload)

            ch.basic_ack(delivery_tag=method.delivery_tag)
        except Exception as e:
            print(f"[Consumer] Erro ao processar mensagem '{routing_key}': {e}")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

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
                    self.channel.basic_consume(queue=self.queue_name, on_message_callback=self.process_message, auto_ack=False)
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
