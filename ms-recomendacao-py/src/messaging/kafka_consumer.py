import json
import os
import time
import logging
from threading import Thread
from typing import Optional
# pyrefly: ignore [missing-import]
from kafka import KafkaConsumer
from database import SessionLocal
from models import RestauranteReplica, CategoriaReplica, ProdutoReplica

# Configuração de Logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("KafkaCDCConsumer")


class KafkaCDCConsumer:
    def __init__(self):
        self.bootstrap_servers = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092")
        self.topics = [
            "dbserver1.public.restaurantes",
            "dbserver1.public.categorias",
            "dbserver1.public.produtos"
        ]
        self.consumer: Optional[KafkaConsumer] = None
        self.running = False
        self.thread = None

    def start(self):
        """Inicia o consumo do Kafka em uma thread separada."""
        self.running = True
        self.thread = Thread(target=self._run, daemon=True)
        self.thread.start()
        logger.info("Thread do consumer Kafka CDC iniciada.")

    def stop(self):
        """Para o consumo e fecha a conexão."""
        self.running = False
        if self.consumer is not None:
            # pyrefly: ignore [missing-attribute]
            self.consumer.close()
            logger.info("Conexão do consumer Kafka encerrada.")

    def _run(self):
        """Loop principal de consumo do Kafka."""
        # Loop de reconexão inicial resiliente
        while self.running:
            try:
                logger.info(f"Conectando ao Kafka em {self.bootstrap_servers}...")
                # pyrefly: ignore [bad-assignment]
                self.consumer = KafkaConsumer(
                    *self.topics,
                    bootstrap_servers=self.bootstrap_servers,
                    value_deserializer=lambda m: json.loads(m.decode("utf-8")) if m is not None else None,
                    auto_offset_reset="earliest",
                    group_id="ms-recomendacao-group-v2"
                )
                logger.info(f"Conectado com sucesso ao Kafka. Escutando tópicos: {self.topics}")
                break
            except Exception as e:
                logger.error(f"Erro ao conectar ao Kafka: {e}. Rebuscando em 5 segundos...")
                time.sleep(5)

        if not self.running:
            return

        # Consumo de mensagens
        while self.running:
            try:
                if self.consumer is None:
                    time.sleep(1)
                    continue
                # Poll de mensagens para permitir interrupção limpa
                # pyrefly: ignore [missing-attribute]
                messages = self.consumer.poll(timeout_ms=1000)
                for topic_partition, records in messages.items():
                    for record in records:
                        self._process_message(record.topic, record.value)
            except Exception as e:
                if self.running:
                    logger.error(f"Erro no loop de consumo do Kafka: {e}")
                    time.sleep(2)

    def _process_message(self, topic, message):
        """Processa a mensagem CDC do Debezium."""
        if not message:
            # Ignora mensagens de tombstone (deletes em cascata geram tombstone para o Kafka compaction)
            return

        payload = message.get("payload")
        if not payload:
            return

        op = payload.get("op")
        before = payload.get("before")
        after = payload.get("after")

        logger.info(f"Recebida mensagem CDC do tópico {topic}. Operação: {op}")

        db = SessionLocal()
        try:
            if topic == "dbserver1.public.restaurantes":
                self._handle_restaurante(db, op, before, after)
            elif topic == "dbserver1.public.categorias":
                self._handle_categoria(db, op, before, after)
            elif topic == "dbserver1.public.produtos":
                self._handle_produto(db, op, before, after)
            
            db.commit()
        except Exception as e:
            db.rollback()
            logger.error(f"Erro ao persistir alteração CDC localmente para o tópico {topic}: {e}")
        finally:
            db.close()

    def _handle_restaurante(self, db, op, before, after):
        """Trata alterações na réplica de restaurantes."""
        if op in ["c", "r", "u"]:
            rest_id = after.get("id")
            nome = after.get("nome")
            lat = after.get("latitude")
            lon = after.get("longitude")

            rest = db.query(RestauranteReplica).filter(RestauranteReplica.id == rest_id).first()
            if rest:
                # pyrefly: ignore [bad-assignment]
                rest.nome = nome
                # pyrefly: ignore [bad-assignment]
                rest.latitude = lat
                # pyrefly: ignore [bad-assignment]
                rest.longitude = lon
                logger.info(f"Restaurante #{rest_id} atualizado na réplica local.")
            else:
                # Default plano como GRATUITO ao cadastrar novo
                new_rest = RestauranteReplica(id=rest_id, nome=nome, latitude=lat, longitude=lon, plano="GRATUITO")
                db.add(new_rest)
                logger.info(f"Restaurante #{rest_id} criado na réplica local.")
        elif op == "d":
            rest_id = before.get("id")
            rest = db.query(RestauranteReplica).filter(RestauranteReplica.id == rest_id).first()
            if rest:
                db.delete(rest)
                logger.info(f"Restaurante #{rest_id} removido da réplica local.")

    def _handle_categoria(self, db, op, before, after):
        """Trata alterações na réplica de categorias."""
        if op in ["c", "r", "u"]:
            cat_id = after.get("id")
            nome = after.get("nome")
            rest_id = after.get("restaurante_id")

            cat = db.query(CategoriaReplica).filter(CategoriaReplica.id == cat_id).first()
            if cat:
                # pyrefly: ignore [bad-assignment]
                cat.nome = nome
                # pyrefly: ignore [bad-assignment]
                cat.restaurante_id = rest_id
                logger.info(f"Categoria #{cat_id} atualizada na réplica local.")
            else:
                new_cat = CategoriaReplica(id=cat_id, nome=nome, restaurante_id=rest_id)
                db.add(new_cat)
                logger.info(f"Categoria #{cat_id} criada na réplica local.")

            # Resolve/corrige produtos que foram carregados out-of-order e estão com restaurante_id = 0
            produtos_pendentes = db.query(ProdutoReplica).filter(
                ProdutoReplica.categoria_id == cat_id,
                ProdutoReplica.restaurante_id == 0
            ).all()
            for prod in produtos_pendentes:
                # pyrefly: ignore [bad-assignment]
                prod.restaurante_id = rest_id
                logger.info(f"Produto #{prod.id} corrigido na réplica local para pertencer ao restaurante #{rest_id}.")
        elif op == "d":
            cat_id = before.get("id")
            cat = db.query(CategoriaReplica).filter(CategoriaReplica.id == cat_id).first()
            if cat:
                db.delete(cat)
                logger.info(f"Categoria #{cat_id} removida da réplica local.")

    def _handle_produto(self, db, op, before, after):
        """Trata alterações na réplica de produtos."""
        if op in ["c", "r", "u"]:
            prod_id = after.get("id")
            nome = after.get("nome")
            preco = after.get("preco")
            cat_id = after.get("categoria_id")

            # Resolve o restaurante_id consultando a réplica de categorias
            restaurante_id = 0
            if cat_id:
                cat = db.query(CategoriaReplica).filter(CategoriaReplica.id == cat_id).first()
                if cat:
                    restaurante_id = cat.restaurante_id

            prod = db.query(ProdutoReplica).filter(ProdutoReplica.id == prod_id).first()
            if prod:
                # pyrefly: ignore [bad-assignment]
                prod.nome = nome
                # pyrefly: ignore [bad-assignment]
                prod.preco = preco
                # pyrefly: ignore [bad-assignment]
                prod.categoria_id = cat_id
                # pyrefly: ignore [bad-assignment]
                prod.restaurante_id = restaurante_id
                logger.info(f"Produto #{prod_id} atualizado na réplica local (restaurante #{restaurante_id}).")
            else:
                new_prod = ProdutoReplica(id=prod_id, nome=nome, preco=preco, categoria_id=cat_id, restaurante_id=restaurante_id)
                db.add(new_prod)
                logger.info(f"Produto #{prod_id} criado na réplica local (restaurante #{restaurante_id}).")
        elif op == "d":
            prod_id = before.get("id")
            prod = db.query(ProdutoReplica).filter(ProdutoReplica.id == prod_id).first()
            if prod:
                db.delete(prod)
                logger.info(f"Produto #{prod_id} removido da réplica local.")