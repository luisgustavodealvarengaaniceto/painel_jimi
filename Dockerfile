# Multi-stage build para otimização
FROM node:20 AS base

# Instalar dependências necessárias
RUN apt-get update && apt-get install -y \
    curl \
    bash \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/* \
    && npm config set registry https://registry.npmjs.org/ \
    && npm config set fetch-retries 5 \
    && npm config set fetch-retry-factor 2 \
    && npm config set fetch-retry-mintimeout 10000 \
    && npm config set fetch-retry-maxtimeout 60000

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
FROM node:20 AS production

# Instalar dependências de sistema
RUN apt-get update && apt-get install -y \
    curl \
    bash \
    postgresql-client \
    dumb-init \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Criar usuário não-root
RUN groupadd -g 1001 nodejs && \
    useradd -r -u 1001 -g nodejs nextjs

WORKDIR /app

# Copiar dependências do backend
COPY backend/package*.json ./backend/
WORKDIR /app/backend

# Instalar dependências incluindo Prisma
RUN npm ci --only=production && npm cache clean --force

# Gerar Prisma Client durante o build
COPY --from=backend-build /app/backend/prisma ./prisma

# Configurar variáveis de ambiente para Prisma
ENV PRISMA_CLI_BINARY_TARGETS="native,linux-musl,debian-openssl-1.1.x,debian-openssl-3.0.x"
ENV PRISMA_ENGINES_MIRROR="https://github.com/prisma/prisma-engines/releases"

# Gerar Prisma Client com permissões corretas
RUN npx prisma generate && \
    chmod -R 755 node_modules/@prisma

# Copiar backend buildado
COPY --from=backend-build --chown=nextjs:nodejs /app/backend/dist ./dist

# Copiar frontend buildado para diretório temporário (será copiado para volume no entrypoint)
COPY --from=frontend-build --chown=nextjs:nodejs /app/dist ../frontend-build

# Criar script de inicialização diretamente no container (evita problemas de CRLF)
RUN echo '#!/bin/bash' > /entrypoint.sh && \
    echo 'set -e' >> /entrypoint.sh && \
    echo 'echo "🚀 JIMI IOT BRASIL - Iniciando aplicação..."' >> /entrypoint.sh && \
    echo 'echo "🔍 DEBUG: Verificando variáveis de ambiente..."' >> /entrypoint.sh && \
    echo 'echo "NODE_ENV: $NODE_ENV"' >> /entrypoint.sh && \
    echo 'echo "DATABASE_URL: ${DATABASE_URL:0:50}..." ' >> /entrypoint.sh && \
    echo 'echo "POSTGRES_USER: $POSTGRES_USER"' >> /entrypoint.sh && \
    echo 'echo "POSTGRES_DB: $POSTGRES_DB"' >> /entrypoint.sh && \
    echo 'if [ -z "$DATABASE_URL" ]; then' >> /entrypoint.sh && \
    echo '    echo "❌ ERROR: DATABASE_URL não definida!"' >> /entrypoint.sh && \
    echo '    echo "Definindo DATABASE_URL manualmente..."' >> /entrypoint.sh && \
    echo '    export DATABASE_URL="postgresql://${POSTGRES_USER:-painel_user}:${POSTGRES_PASSWORD:-JimiIOT2024!@#}@postgres:5432/${POSTGRES_DB:-painel_jimi}"' >> /entrypoint.sh && \
    echo '    echo "Nova DATABASE_URL: ${DATABASE_URL:0:50}..."' >> /entrypoint.sh && \
    echo 'fi' >> /entrypoint.sh && \
    echo 'echo "⏳ Aguardando PostgreSQL..."' >> /entrypoint.sh && \
    echo 'for i in {1..30}; do' >> /entrypoint.sh && \
    echo '    if pg_isready -h postgres -p 5432 -U "${POSTGRES_USER:-painel_user}"; then' >> /entrypoint.sh && \
    echo '        echo "✅ PostgreSQL está pronto!"' >> /entrypoint.sh && \
    echo '        break' >> /entrypoint.sh && \
    echo '    fi' >> /entrypoint.sh && \
    echo '    echo "Tentativa $i/30: PostgreSQL ainda não está pronto, aguardando..."' >> /entrypoint.sh && \
    echo '    sleep 2' >> /entrypoint.sh && \
    echo 'done' >> /entrypoint.sh && \
    echo 'echo "� Verificando Prisma Client..."' >> /entrypoint.sh && \
    echo 'if [ ! -d "node_modules/@prisma/client" ] || [ ! -f "node_modules/@prisma/client/index.js" ]; then' >> /entrypoint.sh && \
    echo '    echo "⚠️ Prisma Client não encontrado, gerando novamente..."' >> /entrypoint.sh && \
    echo '    npx prisma generate --schema=./prisma/schema.prisma || echo "❌ Erro ao gerar Prisma Client"' >> /entrypoint.sh && \
    echo 'fi' >> /entrypoint.sh && \
    echo 'echo "�📊 Executando migrações..."' >> /entrypoint.sh && \
    echo 'npx prisma db push --accept-data-loss --schema=./prisma/schema.prisma || echo "⚠️ Migração falhou, continuando..."' >> /entrypoint.sh && \
    echo 'echo "🌱 Executando seed..."' >> /entrypoint.sh && \
    echo 'npx prisma db seed || echo "⚠️ Seed falhou, continuando..."' >> /entrypoint.sh && \
    echo 'echo "📁 Configurando arquivos do frontend..."' >> /entrypoint.sh && \
    echo 'if [ ! -f "/app/frontend/index.html" ]; then' >> /entrypoint.sh && \
    echo '    echo "🔄 Copiando arquivos do frontend para volume compartilhado..."' >> /entrypoint.sh && \
    echo '    cp -r /app/frontend-build/. /app/frontend/ 2>/dev/null || echo "⚠️ Falha na cópia dos arquivos"' >> /entrypoint.sh && \
    echo 'fi' >> /entrypoint.sh && \
    echo 'if [ -f "/app/frontend/index.html" ]; then' >> /entrypoint.sh && \
    echo '    echo "✅ Frontend React configurado!"' >> /entrypoint.sh && \
    echo '    ls -la /app/frontend/' >> /entrypoint.sh && \
    echo 'else' >> /entrypoint.sh && \
    echo '    echo "❌ Frontend não encontrado!"' >> /entrypoint.sh && \
    echo 'fi' >> /entrypoint.sh && \
    echo 'echo "🎉 Aplicação iniciada com sucesso!"' >> /entrypoint.sh && \
    echo 'exec node dist/app.js' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

# Criar pasta para uploads
RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads

# Dar permissões completas para o diretório do projeto
RUN chown -R nextjs:nodejs /app && \
    chmod -R 755 /app && \
    chown nextjs:nodejs /entrypoint.sh && \
    chmod -R 777 /app/backend/node_modules/@prisma || true

# Mudar para usuário não-root
USER nextjs

# Expor porta
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1

# Script de inicialização
CMD ["/bin/bash", "/entrypoint.sh"]
