# JIMI IOT Brasil - Dockerfile Moderno com Drizzle ORM
FROM node:20-alpine

# Instalar dependências necessárias
RUN apk add --no-cache postgresql-client curl bash

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY backend/package*.json ./backend/

# Instalar dependências
RUN npm ci && npm cache clean --force

WORKDIR /app/backend
RUN npm ci && npm cache clean --force

WORKDIR /app

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

WORKDIR /app/backend
RUN npm run build

# Preparar aplicação
RUN mkdir -p /app/uploads /app/frontend
RUN cp -r /app/dist/* /app/frontend/ 2>/dev/null || true

# Script de inicialização
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 3001

# Health check para monitoramento
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "const http = require('http'); \
    const req = http.request({hostname: 'localhost', port: 3001, path: '/api/health', timeout: 5000}, (res) => { \
      process.exit(res.statusCode === 200 ? 0 : 1); \
    }); \
    req.on('error', () => process.exit(1)); \
    req.end();"

CMD ["/start.sh"]