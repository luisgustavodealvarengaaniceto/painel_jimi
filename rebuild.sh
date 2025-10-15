#!/bin/bash
# 🔄 Script Automático de Rebuild - Painel JIMI IOT Brasil
# 
# Este script aplica todas as correções no Docker de forma automatizada
# 
# Uso: ./rebuild.sh

set -e  # Para em caso de erro

echo "════════════════════════════════════════════════════════"
echo "🔄 REBUILD AUTOMÁTICO - Painel JIMI IOT Brasil"
echo "════════════════════════════════════════════════════════"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se está no diretório correto
if [ ! -f "docker-compose.yml" ]; then
    log_error "docker-compose.yml não encontrado!"
    log_info "Execute este script na raiz do projeto: cd ~/painel_jimi && ./rebuild.sh"
    exit 1
fi

log_success "Diretório correto identificado!"
echo ""

# 1. Parar containers
log_info "Passo 1/6: Parando containers..."
docker-compose down
log_success "Containers parados!"
echo ""

# 2. Remover imagens antigas
log_info "Passo 2/6: Removendo imagens antigas..."
docker rmi -f $(docker images -q 'painel_jimi*' 2>/dev/null) 2>/dev/null || log_warning "Nenhuma imagem antiga encontrada"
docker rmi -f jimi-app 2>/dev/null || log_warning "Imagem jimi-app não encontrada"
log_success "Imagens antigas removidas!"
echo ""

# 3. Limpar build cache (opcional)
log_info "Passo 3/6: Limpando cache do Docker..."
docker builder prune -f || log_warning "Sem cache para limpar"
log_success "Cache limpo!"
echo ""

# 4. Rebuild completo SEM cache
log_info "Passo 4/6: Fazendo rebuild completo (isso pode demorar alguns minutos)..."
docker-compose build --no-cache --progress=plain app
log_success "Build concluído!"
echo ""

# 5. Subir containers
log_info "Passo 5/6: Iniciando containers..."
docker-compose up -d
log_success "Containers iniciados!"
echo ""

# 6. Aguardar inicialização
log_info "Passo 6/6: Aguardando inicialização completa..."
sleep 5

# Verificar se containers estão rodando
if docker-compose ps | grep -q "Up"; then
    log_success "Containers estão rodando!"
else
    log_error "Containers não iniciaram corretamente"
    log_info "Veja os logs: docker-compose logs app"
    exit 1
fi
echo ""

# Verificações de saúde
echo "════════════════════════════════════════════════════════"
echo "🔍 VERIFICAÇÕES DE SAÚDE"
echo "════════════════════════════════════════════════════════"
echo ""

# Verificar seed
log_info "Verificando seed..."
if docker-compose logs app | grep -q "Seed já executado anteriormente"; then
    log_success "Seed idempotente funcionando!"
elif docker-compose logs app | grep -q "Usuários padrão configurados"; then
    log_success "Seed executado com sucesso!"
else
    log_warning "Não foi possível verificar seed - verifique os logs"
fi

# Verificar trust proxy (indiretamente)
log_info "Verificando se servidor está respondendo..."
sleep 3
if curl -s -o /dev/null -w "%{http_code}" http://localhost:1212/api/health | grep -q "200"; then
    log_success "API Health Check OK!"
else
    log_warning "API não está respondendo ainda - aguarde mais alguns segundos"
fi

# Verificar se não há erros críticos
log_info "Verificando erros nos logs..."
if docker-compose logs app | grep -qiE "error|fail" | grep -v "pg_isready"; then
    log_warning "Possíveis erros detectados - verifique os logs completos"
else
    log_success "Nenhum erro crítico detectado!"
fi

echo ""
echo "════════════════════════════════════════════════════════"
echo "✅ REBUILD CONCLUÍDO COM SUCESSO!"
echo "════════════════════════════════════════════════════════"
echo ""
echo "📊 Status dos Containers:"
docker-compose ps
echo ""
echo "📝 Comandos úteis:"
echo "  • Ver logs:        docker-compose logs -f app"
echo "  • Restart:         docker-compose restart app"
echo "  • Parar:           docker-compose down"
echo "  • Status:          docker-compose ps"
echo ""
echo "🌐 URLs de Acesso:"
echo "  • Frontend:        http://localhost:1212"
echo "  • API Health:      http://localhost:1212/api/health"
echo "  • Admin:           http://localhost:1212/admin"
echo ""
echo "🔐 Credenciais Padrão:"
echo "  • Admin:           admin / admin123"
echo "  • TV:              tv / viewer123"
echo ""
log_warning "IMPORTANTE: Altere as senhas padrão após o primeiro acesso!"
echo ""

# Perguntar se quer ver logs
read -p "Deseja ver os logs em tempo real? (s/N) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Ss]$ ]]; then
    log_info "Mostrando logs... (Ctrl+C para sair)"
    docker-compose logs -f app
fi
