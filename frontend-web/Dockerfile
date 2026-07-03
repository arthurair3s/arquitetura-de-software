# --- Estágio 1: Build da aplicação ---
FROM node:20-alpine AS builder
WORKDIR /app

# Argumento para expor as variáveis do Railway durante o build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Copia arquivos de dependência e instala
COPY frontend-web/package*.json ./
RUN npm install

# Copia o restante do código
COPY frontend-web/ ./

# Executa o build de produção do Vite (gera pasta dist)
RUN npm run build

# --- Estágio 2: Servidor Web Nginx de Produção ---
FROM nginx:alpine

# A imagem oficial do Nginx executa automaticamente o envsubst em arquivos
# dentro de /etc/nginx/templates/ e os envia para /etc/nginx/conf.d/
COPY frontend-web/default.conf.template /etc/nginx/templates/default.conf.template

# Copia os arquivos estáticos compilados do estágio anterior
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
# O Nginx iniciará e substituirá o ${PORT} na configuração automaticamente
