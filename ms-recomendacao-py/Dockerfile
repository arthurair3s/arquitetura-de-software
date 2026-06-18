FROM python:3.12-slim

WORKDIR /app

COPY ms-recomendacao-py/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia a pasta de protos para compilação local no build do container
COPY protos ./protos
COPY ms-recomendacao-py/src ./src

# Compila o proto para stubs Python diretamente na raiz de src
RUN python -m grpc_tools.protoc -I./protos --python_out=./src --grpc_python_out=./src protos/recomendacao.proto

ENV PYTHONPATH=/app/src
ENV PYTHONUNBUFFERED=1

CMD ["python", "src/main.py"]
