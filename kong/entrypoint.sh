#!/bin/sh
# Usa a porta dinâmica do Railway ($PORT) se disponível, senão usa 8000
export KONG_PROXY_LISTEN="0.0.0.0:${PORT:-8000}"

echo "Kong escutando na porta: ${PORT:-8000}"
echo "API_URL configurada: ${API_URL:-'(hardcoded no template)'}"

# Substitui variáveis no template de configuração do Kong usando os valores de ambiente
envsubst < /usr/local/kong/declarative/kong.template.yml > /usr/local/kong/declarative/kong.yml

echo "--- kong.yml gerado ---"
cat /usr/local/kong/declarative/kong.yml
echo "--- fim kong.yml ---"

# Executa o entrypoint oficial do Kong
exec /docker-entrypoint.sh kong docker-start
