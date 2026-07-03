FROM node:20-alpine
WORKDIR /app

# Copia arquivos de dependência do api-node
COPY api-node/package*.json ./api-node/
WORKDIR /app/api-node
RUN npm install

# Volta para a raiz e copia todo o monorepo (incluindo a pasta /protos)
WORKDIR /app
COPY . .

# Gera o client do Prisma dentro de api-node
WORKDIR /app/api-node
RUN npx prisma generate

EXPOSE 4000
CMD ["npm", "run", "dev"]