#!/bin/bash

# Script de diagnóstico para JIMI IOT Dashboard
# Execute este script se tiver problemas com o Docker

echo "🔍 JIMI IOT Dashboard - Diagnóstico Docker"
echo "========================================"
echo ""

# Verificar se Docker está rodando
echo "📦 Verificando Docker..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando ou não está instalado"
    exit 1
fi
echo "✅ Docker está rodando"

# Verificar se Docker Compose está disponível
echo ""
echo "📦 Verificando Docker Compose..."
if ! docker compose version > /dev/null 2>&1; then
    echo "❌ Docker Compose não está disponível"
    exit 1
fi
echo "✅ Docker Compose está disponível"

# Verificar portas
echo ""
echo "🔌 Verificando portas..."
if netstat -tlnp 2>/dev/null | grep -q ":1212 " || ss -tlnp 2>/dev/null | grep -q ":1212 "; then
    echo "⚠️  Porta 1212 está em uso"
    echo "   Execute: docker compose down"
    echo "   Ou verifique outros processos: lsof -i :1212"
else
    echo "✅ Porta 1212 está livre"
fi

if netstat -tlnp 2>/dev/null | grep -q ":5432 " || ss -tlnp 2>/dev/null | grep -q ":5432 "; then
    echo "⚠️  Porta 5432 (PostgreSQL) está em uso"
    echo "   Verifique se há outro PostgreSQL rodando"
else
    echo "✅ Porta 5432 está livre"
fi

# Verificar containers
echo ""
echo "🐳 Status dos containers..."
if docker compose ps > /dev/null 2>&1; then
    docker compose ps
else
    echo "❌ Nenhum container do projeto está rodando"
    echo "   Execute: docker compose up -d"
fi

# Verificar recursos do sistema
echo ""
echo "💾 Recursos do sistema..."
echo "Memória livre:"
free -h 2>/dev/null || echo "Comando 'free' não disponível (sistema não Linux)"

echo "Espaço em disco:"
df -h . 2>/dev/null || echo "Comando 'df' não disponível"

# Verificar logs recentes se containers estão rodando
echo ""
echo "📋 Logs recentes (últimas 10 linhas)..."
if docker compose ps | grep -q "jimi-app"; then
    echo "--- Logs do App ---"
    docker compose logs --tail 10 app
    echo ""
    echo "--- Logs do Nginx ---"
    docker compose logs --tail 10 nginx
    echo ""
    echo "--- Logs do PostgreSQL ---"
    docker compose logs --tail 10 postgres
else
    echo "⚠️  Containers não estão rodando"
fi

echo ""
echo "🔧 Comandos para resolver problemas comuns:"
echo ""
echo "# Reconstruir tudo do zero:"
echo "docker compose down -v"
echo "docker compose up --build -d"
echo ""
echo "# Ver logs em tempo real:"
echo "docker compose logs -f"
echo ""
echo "# Reiniciar apenas o app:"
echo "docker compose restart app"
echo ""
echo "# Verificar conectividade do banco:"
echo "docker compose exec postgres pg_isready -U painel_user -d painel_jimi"
echo ""
echo "========================================"
echo "🚀 Se tudo estiver OK, acesse: http://localhost:1212"
echo "👤 Login: admin / admin123"