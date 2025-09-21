#!/bin/bash
set -e

echo "🚀 JIMI IOT BRASIL - Iniciando aplicação..."

# Aguardar PostgreSQL estar pronto
echo "⏳ Aguardando PostgreSQL..."
while ! pg_isready -h postgres -p 5432 -U "${POSTGRES_USER:-painel_user}"; do
    echo "PostgreSQL ainda não está pronto, aguardando..."
    sleep 2
done

echo "✅ PostgreSQL está pronto!"

# Executar migrações
echo "📊 Executando migrações..."
npx prisma db push --accept-data-loss

# Executar seed
echo "🌱 Executando seed..."
npx prisma db seed || echo "⚠️ Seed falhou, continuando..."

# Gerar Prisma Client
echo "🔧 Gerando Prisma Client..."
npx prisma generate

echo "🎉 Aplicação iniciada com sucesso!"

# Iniciar aplicação
exec node dist/app.js
