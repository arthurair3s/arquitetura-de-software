#!/bin/sh
# Substitui variáveis no template de configuração do Kong usando os valores de ambiente
envsubst < /usr/local/kong/declarative/kong.template.yml > /usr/local/kong/declarative/kong.yml

# Executa o entrypoint oficial do Kong
exec /docker-entrypoint.sh kong docker-start
