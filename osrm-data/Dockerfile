FROM osrm/osrm-backend:latest

# Copia os arquivos pré-processados do OSRM para dentro do container
COPY . /data

# Expõe a porta padrão do OSRM
EXPOSE 5000

# Executa o roteador apontando para o mapa do Rio Metropolitano
CMD ["osrm-routed", "--algorithm", "mld", "/data/rio-metropolitano.osrm"]
