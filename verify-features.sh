#!/bin/bash
# 🔍 Script de Verificação - Novas Features do Painel JIMI

echo "════════════════════════════════════════════════════════"
echo "🔍 VERIFICANDO IMPLEMENTAÇÃO DAS NOVAS FEATURES"
echo "════════════════════════════════════════════════════════"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Verificar se container está rodando
if ! docker ps | grep -q "jimi-app"; then
    echo -e "${RED}❌ Container jimi-app não está rodando!${NC}"
    echo "Execute: docker-compose up -d"
    exit 1
fi

echo -e "${GREEN}✅ Container está rodando${NC}"
echo ""

# 1. Verificar se colunas existem no banco
echo -e "${BLUE}1️⃣ Verificando colunas no banco de dados...${NC}"

COLUMNS_CHECK=$(docker exec jimi-postgres psql -U painel_user -d painel_jimi -t -c "
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='slides' AND column_name='expires_at'
    ) THEN 'expires_at_exists' ELSE 'expires_at_missing' END as expires_at,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='slides' AND column_name='is_archived'
    ) THEN 'is_archived_exists' ELSE 'is_archived_missing' END as is_archived,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name='slide_attachments'
    ) THEN 'table_exists' ELSE 'table_missing' END as slide_attachments;
")

if echo "$COLUMNS_CHECK" | grep -q "expires_at_exists"; then
    echo -e "${GREEN}  ✅ Coluna expires_at existe${NC}"
else
    echo -e "${RED}  ❌ Coluna expires_at NÃO existe${NC}"
fi

if echo "$COLUMNS_CHECK" | grep -q "is_archived_exists"; then
    echo -e "${GREEN}  ✅ Coluna is_archived existe${NC}"
else
    echo -e "${RED}  ❌ Coluna is_archived NÃO existe${NC}"
fi

if echo "$COLUMNS_CHECK" | grep -q "table_exists"; then
    echo -e "${GREEN}  ✅ Tabela slide_attachments existe${NC}"
else
    echo -e "${RED}  ❌ Tabela slide_attachments NÃO existe${NC}"
fi

echo ""

# 2. Verificar se migração foi aplicada
echo -e "${BLUE}2️⃣ Verificando migrações aplicadas...${NC}"

MIGRATIONS=$(docker exec jimi-postgres psql -U painel_user -d painel_jimi -t -c "
SELECT version FROM drizzle.__drizzle_migrations ORDER BY created_at;
")

echo "$MIGRATIONS" | while read -r line; do
    if [ ! -z "$line" ]; then
        echo -e "${GREEN}  ✅ Migração: ${line}${NC}"
    fi
done

echo ""

# 3. Verificar se job de expiração está rodando
echo -e "${BLUE}3️⃣ Verificando job de arquivamento...${NC}"

JOB_CHECK=$(docker logs jimi-app 2>&1 | grep -i "arquivado")

if [ ! -z "$JOB_CHECK" ]; then
    echo -e "${GREEN}  ✅ Job de arquivamento está ativo${NC}"
    echo "$JOB_CHECK" | tail -3
else
    echo -e "${YELLOW}  ⚠️  Nenhum log de arquivamento encontrado (normal se não há slides expirados)${NC}"
fi

echo ""

# 4. Verificar endpoints de anexos
echo -e "${BLUE}4️⃣ Verificando endpoints de anexos...${NC}"

ROUTES_CHECK=$(docker exec jimi-app cat dist/app.js | grep -o "slideAttachments" | wc -l)

if [ "$ROUTES_CHECK" -gt 0 ]; then
    echo -e "${GREEN}  ✅ Rotas de slideAttachments encontradas no código compilado${NC}"
else
    echo -e "${RED}  ❌ Rotas de slideAttachments NÃO encontradas${NC}"
fi

echo ""

# 5. Verificar pasta de uploads
echo -e "${BLUE}5️⃣ Verificando pasta de uploads...${NC}"

if docker exec jimi-app test -d /app/uploads; then
    echo -e "${GREEN}  ✅ Pasta /app/uploads existe${NC}"
else
    echo -e "${YELLOW}  ⚠️  Pasta /app/uploads não existe${NC}"
    echo "  Criando pasta..."
    docker exec jimi-app mkdir -p /app/uploads
    echo -e "${GREEN}  ✅ Pasta criada${NC}"
fi

echo ""

# 6. Testar API de slides (verificar se retorna novos campos)
echo -e "${BLUE}6️⃣ Testando API de slides...${NC}"

API_RESPONSE=$(curl -s http://localhost:1212/api/slides)

if echo "$API_RESPONSE" | grep -q "expiresAt"; then
    echo -e "${GREEN}  ✅ API retorna campo expiresAt${NC}"
else
    echo -e "${RED}  ❌ API NÃO retorna campo expiresAt${NC}"
fi

if echo "$API_RESPONSE" | grep -q "isArchived"; then
    echo -e "${GREEN}  ✅ API retorna campo isArchived${NC}"
else
    echo -e "${RED}  ❌ API NÃO retorna campo isArchived${NC}"
fi

echo ""

# Diagnóstico final
echo "════════════════════════════════════════════════════════"
echo "📊 DIAGNÓSTICO FINAL"
echo "════════════════════════════════════════════════════════"

if echo "$COLUMNS_CHECK" | grep -q "missing"; then
    echo ""
    echo -e "${RED}❌ PROBLEMA IDENTIFICADO:${NC}"
    echo "As colunas/tabelas não existem no banco de dados."
    echo ""
    echo -e "${YELLOW}🔧 SOLUÇÃO:${NC}"
    echo "Execute a migração manualmente:"
    echo ""
    echo "  docker exec jimi-app npm run db:migrate"
    echo ""
    echo "Ou force o rebuild completo:"
    echo ""
    echo "  ./rebuild.sh"
    echo ""
elif ! echo "$API_RESPONSE" | grep -q "expiresAt"; then
    echo ""
    echo -e "${YELLOW}⚠️  PROBLEMA PARCIAL:${NC}"
    echo "As colunas existem no banco mas a API não está retornando os novos campos."
    echo ""
    echo -e "${YELLOW}🔧 SOLUÇÃO:${NC}"
    echo "Reinicie o container:"
    echo ""
    echo "  docker-compose restart app"
    echo ""
else
    echo ""
    echo -e "${GREEN}✅ TUDO OK! Novas features estão funcionando!${NC}"
    echo ""
    echo "Features disponíveis:"
    echo "  • Expiração automática de slides"
    echo "  • Upload de anexos de imagens"
    echo "  • Arquivamento de slides expirados"
    echo ""
fi
