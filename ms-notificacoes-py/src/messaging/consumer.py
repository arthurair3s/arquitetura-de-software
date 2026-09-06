import time
import json
import pika
from pika.exceptions import AMQPConnectionError
from config import Config
from services.email_service import EmailService
from services.template_service import TemplateService


class RabbitMQConsumer:
    def __init__(self):
        self.exchange_name = "delivery-events"
        self.queue_name = "notificacoes.eventos"
        self.dlx_exchange_name = "delivery-events.dlx"
        self.dlq_queue_name = "notificacoes.eventos.dlq"
        self.dlq_routing_key = "dlq.notificacoes.eventos"
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

                self.channel.exchange_declare(exchange=self.exchange_name, exchange_type="topic", durable=True)

                # Dead Letter Exchange: um e-mail que falha (SMTP fora do ar, template
                # quebrado) fica retido na DLQ para inspeção em vez de ser descartado.
                self.channel.exchange_declare(exchange=self.dlx_exchange_name, exchange_type="topic", durable=True)
                self.channel.queue_declare(queue=self.dlq_queue_name, durable=True)
                self.channel.queue_bind(exchange=self.dlx_exchange_name, queue=self.dlq_queue_name, routing_key=self.dlq_routing_key)

                self.channel.queue_declare(queue=self.queue_name, durable=True, arguments={
                    "x-dead-letter-exchange": self.dlx_exchange_name,
                    "x-dead-letter-routing-key": self.dlq_routing_key,
                })
                self.channel.queue_bind(exchange=self.exchange_name, queue=self.queue_name, routing_key="pagamento.aprovado")
                self.channel.queue_bind(exchange=self.exchange_name, queue=self.queue_name, routing_key="pedido.entregue")

                print(f"[Consumer] Conectado e escutando a fila '{self.queue_name}'...")
                break
            except AMQPConnectionError as e:
                print(f"[Consumer] Conexão falhou. Tentando novamente em 5s... Erro: {e}")
                time.sleep(5)

    def process_message(self, ch, method, properties, body):
        routing_key = method.routing_key
        payload = {}

        try:
            payload = json.loads(body.decode("utf-8"))
            print(f"[Consumer] Evento recebido '{routing_key}' — Pedido #{payload.get('pedido_id')}")

            if routing_key == "pagamento.aprovado":
                self._handle_pagamento_aprovado(payload)

            elif routing_key == "pedido.entregue":
                self._handle_pedido_entregue(payload)

            ch.basic_ack(delivery_tag=method.delivery_tag)

        except Exception as e:
            print(f"[Consumer] Erro ao processar '{routing_key}': {e}. Enviando para a DLQ '{self.dlq_queue_name}'.")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

    # -------------------------------------------------------------------------
    # Handlers privados por tipo de evento
    # -------------------------------------------------------------------------

    def _handle_pagamento_aprovado(self, payload: dict):
        pedido_id = payload.get("pedido_id")
        nome = payload.get("usuario_nome", "Cliente")
        email = payload.get("usuario_email")
        metodo = payload.get("metodo", "—")
        valor = payload.get("valor", 0)

        if not email:
            print(f"[Consumer] 'pagamento.aprovado' sem email para Pedido #{pedido_id}. Ignorando.")
            return

        html = TemplateService.render("pagamento_aprovado.html", {
            "nome": nome,
            "pedido_id": pedido_id,
            "metodo": metodo,
            "valor": f"{float(valor):.2f}",
        })

        EmailService.enviar_email(
            destinatario=email,
            assunto=f"✅ Pagamento Confirmado — Pedido #{pedido_id}",
            corpo_html=html
        )

    def _handle_pedido_entregue(self, payload: dict):
        pedido_id = payload.get("pedido_id")
        nome = payload.get("usuario_nome", "Cliente")
        email = payload.get("usuario_email")

        if not email:
            print(f"[Consumer] 'pedido.entregue' sem email para Pedido #{pedido_id}. Ignorando.")
            return

        html = TemplateService.render("pedido_entregue.html", {
            "nome": nome,
            "pedido_id": pedido_id,
        })

        EmailService.enviar_email(
            destinatario=email,
            assunto=f"🛵 Seu pedido #{pedido_id} foi entregue!",
            corpo_html=html
        )

    # -------------------------------------------------------------------------

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
