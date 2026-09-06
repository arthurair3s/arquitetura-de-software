#!/bin/sh
# Registra o connector Debezium no Kafka Connect.
#
# Existe porque a configuração do connector nunca esteve versionada: era preciso
# fazer um POST manual na API do Connect depois de cada `docker compose up`, e
# quem clonasse o repositório subia o Kafka sem nenhum dado fluindo.
set -e

CONNECT_URL="${CONNECT_URL:-http://debezium-connect:8083}"
CONFIG="/debezium/connector-catalogo.json"
NOME="delivery-catalogo-connector"

# As credenciais não ficam no arquivo versionado; vêm do ambiente do compose.
for var in DB_USER DB_PASS DB_NAME; do
  eval valor=\$$var
  if [ -z "$valor" ]; then
    echo "[Debezium] ERRO: variável $var não definida." >&2
    exit 1
  fi
done

echo "[Debezium] Aguardando o Kafka Connect em ${CONNECT_URL}..."
i=0
until curl -sf "${CONNECT_URL}/connectors" > /dev/null 2>&1; do
  i=$((i + 1))
  if [ "$i" -gt 60 ]; then
    echo "[Debezium] ERRO: Connect não respondeu após 60 tentativas." >&2
    exit 1
  fi
  sleep 2
done
echo "[Debezium] Connect disponível."

# Idempotente: se o connector já existe, não recria — apenas relata o estado.
if curl -sf "${CONNECT_URL}/connectors/${NOME}" > /dev/null 2>&1; then
  echo "[Debezium] Connector '${NOME}' já registrado. Estado atual:"
  curl -s "${CONNECT_URL}/connectors/${NOME}/status"
  echo
  exit 0
fi

sed -e "s|\${DB_USER}|${DB_USER}|g" \
    -e "s|\${DB_PASS}|${DB_PASS}|g" \
    -e "s|\${DB_NAME}|${DB_NAME}|g" \
    "$CONFIG" > /tmp/connector.json

echo "[Debezium] Registrando '${NOME}'..."
codigo=$(curl -s -o /tmp/resposta.json -w '%{http_code}' \
  -X POST "${CONNECT_URL}/connectors" \
  -H 'Content-Type: application/json' \
  --data @/tmp/connector.json)

if [ "$codigo" = "201" ] || [ "$codigo" = "200" ]; then
  echo "[Debezium] Connector registrado. Snapshot inicial em andamento."
  exit 0
fi

# 409 = corrida com outra instância do init; o connector já está lá.
if [ "$codigo" = "409" ]; then
  echo "[Debezium] Connector já existia (409). Nada a fazer."
  exit 0
fi

echo "[Debezium] ERRO: Connect respondeu ${codigo}." >&2
cat /tmp/resposta.json >&2
exit 1
