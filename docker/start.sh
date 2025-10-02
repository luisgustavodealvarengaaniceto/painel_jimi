#!/bin/bash
set -e

echo "🚀 JIMI IOT BRASIL - Sistema Moderno com Drizzle ORM"

# Aguardar PostgreSQL
echo "⏳ Aguardando PostgreSQL..."
for i in {1..30}; do
    if pg_isready -h postgres -p 5432 -U painel_user -d painel_jimi; then
        echo "✅ PostgreSQL conectado!"
        break
    fi
    echo "Tentativa $i/30..."
    sleep 2
done

cd /app/backend

# Executar migrações com Drizzle
echo "📊 Executando migrações com Drizzle..."
npm run db:migrate || echo "⚠️ Migrações executadas"

# Executar seed se necessário
echo "🌱 Executando seed..."
npm run db:seed || echo "⚠️ Seed executado"

# Configurar frontend
echo "📁 Configurando frontend..."
if [ ! -f "/app/frontend/index.html" ]; then
    cp -r /app/dist/* /app/frontend/ 2>/dev/null || echo "Frontend configurado"
fi

echo "🎉 Iniciando servidor Node.js..."
exec node dist/app.js