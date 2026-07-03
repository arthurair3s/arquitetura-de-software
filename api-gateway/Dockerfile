FROM node:20-alpine
WORKDIR /app

# Copia dependências primeiro (cache layer)
COPY api-gateway/package*.json ./
RUN npm install --production

# Copia o servidor
COPY api-gateway/server.js ./

EXPOSE 8000
CMD ["node", "server.js"]
