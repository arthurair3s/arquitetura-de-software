FROM kong:3.4

# Instala envsubst para interpolação de variáveis no kong.yml
USER root
RUN apt-get update && apt-get install -y gettext-base && rm -rf /var/lib/apt/lists/*

# Copia a configuração declarativa do Kong e o script de entrypoint
COPY kong.template.yml /usr/local/kong/declarative/kong.template.yml
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER kong

ENTRYPOINT ["/entrypoint.sh"]
