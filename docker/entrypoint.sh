#!/bin/bash#!/bin/bash

set -eset -e



echo "🚀 JIMI IOT BRASIL - Iniciando aplicação..."echo "🚀 JIMI IOT BRASIL - Iniciando aplicação..."



# Aguardar PostgreSQL estar pronto# Aguardar PostgreSQL estar pronto

echo "⏳ Aguardando PostgreSQL..."echo "⏳ Aguardando PostgreSQL..."

while ! pg_isready -h postgres -p 5432 -U "${POSTGRES_USER:-painel_user}"; dowhile ! pg_isready -h postgres -p 5432 -U "${POSTGRES_USER:-painel_user}"; do

    echo "PostgreSQL ainda não está pronto, aguardando..."    echo "PostgreSQL ainda não está pronto, aguardando..."

    sleep 2    sleep 2

donedone



echo "✅ PostgreSQL está pronto!"echo "✅ PostgreSQL está pronto!"



# Executar migrações# Executar migrações

echo "📊 Executando migrações..."echo "📊 Executando migrações..."

npx prisma db push --accept-data-loss --schema=./prisma/schema.prismanpx prisma db push --accept-data-loss --schema=./prisma/schema.prisma



# Executar seed# Executar seed

echo "🌱 Executando seed..."echo "🌱 Executando seed..."

npx prisma db seed || echo "⚠️ Seed falhou, continuando..."npx prisma db seed || echo "⚠️ Seed falhou, continuando..."



echo "🎉 Aplicação iniciada com sucesso!"echo "🎉 Aplicação iniciada com sucesso!"



# Iniciar aplicação# Iniciar aplicação

exec node dist/app.jsexec node dist/app.js
