#!/bin/bash
# Script simples para enviar mudanças para o servidor

SERVER="ubuntu@137.131.170.156"
PROJECT_DIR="~/painel_jimi"

echo "🚀 Enviando arquivos para o servidor..."

# Enviar arquivos essenciais
echo "📁 Enviando nginx.conf..."
scp nginx.conf $SERVER:$PROJECT_DIR/

echo "📁 Enviando docker-compose.yml..."
scp docker-compose.yml $SERVER:$PROJECT_DIR/

echo "📁 Enviando Dockerfile..."
scp Dockerfile $SERVER:$PROJECT_DIR/

echo "📁 Enviando backend/package.json..."
scp backend/package.json $SERVER:$PROJECT_DIR/backend/

echo "📁 Enviando backend/drizzle.config.ts..."
scp backend/drizzle.config.ts $SERVER:$PROJECT_DIR/backend/

echo "📁 Enviando script de start..."
scp docker/start.sh $SERVER:$PROJECT_DIR/docker/

echo "📁 Enviando schema do Drizzle..."
scp backend/src/db/schema.ts $SERVER:$PROJECT_DIR/backend/src/db/
scp backend/src/db/index.ts $SERVER:$PROJECT_DIR/backend/src/db/
scp backend/src/db/seed.ts $SERVER:$PROJECT_DIR/backend/src/db/

echo "📁 Enviando app.ts atualizado..."
scp backend/src/app.ts $SERVER:$PROJECT_DIR/backend/src/

echo "📁 Enviando migração..."
scp backend/drizzle/0000_initial.sql $SERVER:$PROJECT_DIR/backend/drizzle/

echo "✅ Arquivos enviados! Agora execute no servidor:"
echo "cd ~/painel_jimi"
echo "docker-compose down"
echo "docker-compose up -d --build"