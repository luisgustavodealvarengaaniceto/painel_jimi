# Multi-stage build para otimização
FROM node:18-alpine AS base

# Instalar dependências necessárias
RUN apk add --no-cache \
    curl \
    bash \
    postgresql-client

WORKDIR /app

# Copiar package.json files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Stage 1: Build Frontend
FROM base AS frontend-build

# Instalar dependências do frontend
RUN npm install

# Copiar código do frontend
COPY . .

# Build do frontend
RUN npm run build

# Stage 2: Build Backend
FROM base AS backend-build

WORKDIR /app/backend

# Instalar dependências do backend
RUN npm install

# Copiar código do backend
COPY backend/ .

# Build do backend
RUN npm run build

# Stage 3: Production
FROM node:18-alpine AS production

# Instalar dependências de sistema
RUN apk add --no-cache \
    curl \
    bash \
    postgresql-client \
    dumb-init

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

WORKDIR /app

# Copiar dependências do backend
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --only=production && npm cache clean --force

# Copiar backend buildado
COPY --from=backend-build --chown=nextjs:nodejs /app/backend/dist ./dist
COPY --from=backend-build --chown=nextjs:nodejs /app/backend/prisma ./prisma

# Copiar frontend buildado
COPY --from=frontend-build --chown=nextjs:nodejs /app/dist ../frontend

# Copiar script de inicialização
COPY --chown=nextjs:nodejs docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Criar pasta para uploads
RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads

# Mudar para usuário não-root
USER nextjs

# Expor porta
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1

# Script de inicialização
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["/entrypoint.sh"]
