#!/bin/bash
# filepath: c:\Users\gutoa\OneDrive\Documentos\painel_jimi\deploy-docker.sh

set -e

echo "🐳 JIMI IOT BRASIL - Docker Deploy Script"
echo "========================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
}

# Verificar se Docker e Docker Compose estão instalados
check_dependencies() {
    log "Verificando dependências..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker não está instalado!"
        echo "Instale Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose não está instalado!"
        echo "Instale Docker Compose: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    log "✅ Dependências verificadas"
}

# Verificar se o arquivo .env.docker existe
check_env_file() {
    log "Verificando arquivo de environment..."
    
    if [ ! -f ".env.docker" ]; then
        warn "Arquivo .env.docker não encontrado. Criando arquivo padrão..."
        
        cat > .env.docker << EOF
# Database
POSTGRES_DB=painel_jimi
POSTGRES_USER=painel_user
POSTGRES_PASSWORD=JimiIOT2024!@#
DATABASE_URL=postgresql://painel_user:JimiIOT2024!@#@postgres:5432/painel_jimi

# JWT
JWT_SECRET=jimi-iot-brasil-super-secure-docker-key-2024
JWT_EXPIRES_IN=7d

# Server
NODE_ENV=production
PORT=3001

# Frontend URL
FRONTEND_URL=http://localhost:1212
EOF
        
        log "✅ Arquivo .env.docker criado com valores padrão"
        warn "⚠️  Altere as senhas em .env.docker antes de usar em produção!"
    else
        log "✅ Arquivo .env.docker encontrado"
    fi
}

# Parar containers existentes
stop_existing_containers() {
    log "Parando containers existentes..."
    
    if docker-compose ps | grep -q "Up"; then
        docker-compose down
        log "✅ Containers parados"
    else
        log "ℹ️  Nenhum container rodando"
    fi
}

# Limpar volumes e imagens antigas (opcional)
cleanup() {
    if [ "$1" = "--clean" ]; then
        log "Limpando volumes e imagens antigas..."
        
        # Remover volumes não utilizados
        docker volume prune -f
        
        # Remover imagens dangling
        docker image prune -f
        
        log "✅ Limpeza concluída"
    fi
}

# Build das imagens
build_images() {
    log "Construindo imagens Docker..."
    
    # Build com cache
    docker-compose build --parallel
    
    log "✅ Imagens construídas com sucesso"
}

# Iniciar serviços
start_services() {
    log "Iniciando serviços..."
    
    # Subir em background
    docker-compose up -d
    
    log "✅ Serviços iniciados"
}

# Aguardar serviços ficarem saudáveis
wait_for_health() {
    log "Aguardando serviços ficarem saudáveis..."
    
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if docker-compose ps | grep -q "unhealthy"; then
            warn "Alguns serviços ainda não estão saudáveis... ($((attempt + 1))/$max_attempts)"
            sleep 10
            ((attempt++))
        else
            log "✅ Todos os serviços estão saudáveis"
            return 0
        fi
    done
    
    error "Timeout: Serviços não ficaram saudáveis em tempo hábil"
    docker-compose logs
    return 1
}

# Executar migrações e seed
run_migrations() {
    log "Executando migrações do banco de dados..."
    
    # Aguardar PostgreSQL estar pronto
    sleep 5
    
    # Executar migrações
    docker-compose exec -T app npm run migrate
    
    # Executar seed
    docker-compose exec -T app npm run seed
    
    log "✅ Migrações e seed executados"
}

# Mostrar status final
show_status() {
    log "Status dos serviços:"
    docker-compose ps
    
    echo ""
    log "🌐 URLs de acesso:"
    echo "   Admin:   http://localhost:1212/admin"
    echo "   Display: http://localhost:1212/display"
    echo "   Login:   http://localhost:1212/login"
    echo ""
    log "🔑 Credenciais padrão:"
    echo "   Usuário: admin"
    echo "   Senha:   admin123"
    echo ""
    warn "⚠️  IMPORTANTE: Altere a senha após o primeiro login!"
}

# Mostrar logs
show_logs() {
    if [ "$1" = "--logs" ]; then
        log "Mostrando logs dos serviços..."
        docker-compose logs -f
    fi
}

# Função de ajuda
show_help() {
    echo "Uso: $0 [opções]"
    echo ""
    echo "Opções:"
    echo "  --clean     Limpar volumes e imagens antigas antes do deploy"
    echo "  --logs      Mostrar logs após o deploy"
    echo "  --help      Mostrar esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0                    Deploy normal"
    echo "  $0 --clean           Deploy com limpeza"
    echo "  $0 --logs            Deploy e mostrar logs"
    echo "  $0 --clean --logs    Deploy com limpeza e logs"
}

# Função principal
main() {
    # Verificar argumentos
    local clean_flag=false
    local logs_flag=false
    
    for arg in "$@"; do
        case $arg in
            --clean)
                clean_flag=true
                ;;
            --logs)
                logs_flag=true
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                error "Argumento inválido: $arg"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Executar deploy
    check_dependencies
    check_env_file
    stop_existing_containers
    
    if [ "$clean_flag" = true ]; then
        cleanup --clean
    fi
    
    build_images
    start_services
    wait_for_health
    run_migrations
    show_status
    
    if [ "$logs_flag" = true ]; then
        show_logs --logs
    fi
    
    log "🎉 Deploy do JIMI IOT BRASIL concluído com sucesso!"
}

# Capturar sinais para limpeza
trap 'error "Deploy interrompido!"; exit 1' INT TERM

# Executar função principal
main "$@"