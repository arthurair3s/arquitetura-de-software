#!/bin/sh
# Usa a porta dinâmica do Railway ($PORT) se disponível, senão usa 8000
LISTEN_PORT="${PORT:-8000}"

# Escuta em IPv4 E IPv6 (Railway usa IPv6 internamente)
export KONG_PROXY_LISTEN="0.0.0.0:${LISTEN_PORT}, [::]:${LISTEN_PORT}"

echo "Kong escutando na porta: ${LISTEN_PORT} (IPv4 + IPv6)"
echo "KONG_PROXY_LISTEN=${KONG_PROXY_LISTEN}"

# Substitui variáveis no template de configuração do Kong usando os valores de ambiente
envsubst < /usr/local/kong/declarative/kong.template.yml > /usr/local/kong/declarative/kong.yml

echo "--- kong.yml gerado ---"
cat /usr/local/kong/declarative/kong.yml
echo "--- fim kong.yml ---"

# Executa o entrypoint oficial do Kong
exec /docker-entrypoint.sh kong docker-start
