#!/bin/sh
set -e

# A porta é dinâmica em PaaS (Railway injeta $PORT); localmente cai para 8000.
LISTEN_PORT="${PORT:-8000}"

# Escuta em IPv4 e IPv6 — o proxy interno do Railway resolve os serviços por IPv6.
export KONG_PROXY_LISTEN="0.0.0.0:${LISTEN_PORT}, [::]:${LISTEN_PORT}"

# Falha cedo e com mensagem clara: sem upstream, o Kong subiria e devolveria
# erro em toda requisição, o que é bem mais difícil de diagnosticar.
if [ -z "${API_URL}" ]; then
  echo "[Kong] ERRO: variável de ambiente API_URL não definida (ex.: http://api:4000/)." >&2
  exit 1
fi

echo "[Kong] Porta: ${LISTEN_PORT} (IPv4 + IPv6) | Upstream: ${API_URL}"

# Gera a configuração declarativa final a partir do template.
envsubst '${API_URL}' \
  < /usr/local/kong/declarative/kong.template.yml \
  > /usr/local/kong/declarative/kong.yml

exec /docker-entrypoint.sh kong docker-start
