FROM kong:3.4

# Instala envsubst para interpolação de variáveis no kong.yml
USER root
RUN apt-get update && apt-get install -y gettext-base && rm -rf /var/lib/apt/lists/*

# O contexto de build é a raiz do repositório (ver compose.yml / compose.prod.yml).
COPY kong/kong.template.yml /usr/local/kong/declarative/kong.template.yml
COPY kong/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

RUN chown -R kong:kong /usr/local/kong/declarative

USER kong

ENTRYPOINT ["/entrypoint.sh"]
