FROM python:3.12-slim

WORKDIR /app

COPY ms-notificacoes-py/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ms-notificacoes-py/src ./src

ENV PYTHONPATH=/app/src
ENV PYTHONUNBUFFERED=1

CMD ["python", "src/main.py"]
