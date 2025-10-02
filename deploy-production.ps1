#!/usr/bin/env pwsh
# Script de Deploy/Atualização do Painel JIMI IOT Brasil
# 
# Este script faz o deploy das alterações para o servidor de produção

param(
    [string]$ServerIP = "137.131.170.156",
    [string]$User = "ubuntu",
    [switch]$Force = $false
)

$ErrorActionPreference = "Stop"

function Write-Status {
    param([string]$Message)
    Write-Host "🚀 $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

Write-Status "Iniciando deploy para servidor $ServerIP"

# Verificar se git está limpo
$gitStatus = git status --porcelain
if ($gitStatus -and -not $Force) {
    Write-Warning "Existem alterações não commitadas!"
    Write-Host $gitStatus
    $response = Read-Host "Deseja continuar mesmo assim? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Status "Deploy cancelado."
        exit 1
    }
}

# Fazer commit das alterações se necessário
if ($gitStatus) {
    Write-Status "Fazendo commit das alterações..."
    git add .
    git commit -m "Deploy: Atualização com Drizzle ORM e melhorias $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

# Fazer push para o repositório
Write-Status "Fazendo push para repositório..."
try {
    git push origin main
    Write-Success "Push realizado com sucesso!"
} catch {
    Write-Warning "Erro no push, continuando..."
}

# Comandos para executar no servidor
$deployCommands = @"
#!/bin/bash
set -e

echo "🚀 Iniciando deploy no servidor..."

# Navegar para diretório do projeto
cd ~/painel_jimi

# Fazer backup do docker-compose atual
echo "💾 Fazendo backup da configuração atual..."
cp docker-compose.yml docker-compose.yml.backup.`$(date +%Y%m%d_%H%M%S) || true

# Parar containers atuais
echo "⏸️  Parando containers..."
docker-compose down || true

# Fazer backup do banco se existir
echo "💾 Fazendo backup do banco..."
if docker volume ls | grep -q jimi_postgres_data; then
    docker run --rm -v jimi_postgres_data:/data -v `$(pwd):/backup alpine tar czf /backup/postgres_backup_`$(date +%Y%m%d_%H%M%S).tar.gz /data || true
fi

# Atualizar código do repositório
echo "📥 Atualizando código..."
git fetch origin
git reset --hard origin/main

# Remover nginx.conf se for diretório
if [ -d nginx.conf ]; then
    echo "🗑️  Removendo nginx.conf incorreto..."
    sudo rm -rf nginx.conf
fi

# Verificar se nginx.conf existe como arquivo
if [ ! -f nginx.conf ]; then
    echo "📝 Criando nginx.conf..."
    cat > nginx.conf << 'NGINX_EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logs
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1000;

    # Upstream para o backend
    upstream backend {
        server app:3001;
    }

    server {
        listen 80;
        server_name _;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";

        # API routes
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host `$host;
            proxy_set_header X-Real-IP `$remote_addr;
            proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto `$scheme;
            
            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # Static files
        location / {
            root /app/frontend;
            try_files `$uri `$uri/ /index.html;
            
            # Cache static assets
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)`$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
NGINX_EOF
fi

# Limpar containers e volumes antigos
echo "🧹 Limpeza de containers antigos..."
docker system prune -f || true

# Build e start dos novos containers
echo "🏗️  Building e iniciando containers..."
docker-compose up -d --build

# Aguardar containers ficarem prontos
echo "⏳ Aguardando containers ficarem prontos..."
sleep 30

# Verificar status
echo "📊 Verificando status dos containers..."
docker-compose ps

# Testar health check
echo "🏥 Testando health check..."
sleep 10
curl -f http://localhost:1212/api/health || echo "Health check falhou"

echo "✅ Deploy concluído!"
echo "🌐 Aplicação disponível em: http://137.131.170.156:1212"
echo "🔑 Login: admin / admin123"
"@

# Salvar comandos em arquivo temporário
$tempScript = [System.IO.Path]::GetTempFileName() + ".sh"
$deployCommands | Out-File -FilePath $tempScript -Encoding UTF8

try {
    Write-Status "Conectando ao servidor e executando deploy..."
    
    # Transferir e executar script
    scp $tempScript "${User}@${ServerIP}:/tmp/deploy.sh"
    ssh "${User}@${ServerIP}" "chmod +x /tmp/deploy.sh && /tmp/deploy.sh"
    
    Write-Success "Deploy executado com sucesso!"
    Write-Host "🌐 Aplicação disponível em: http://$ServerIP:1212" -ForegroundColor Green
    Write-Host "🔑 Login: admin / admin123" -ForegroundColor Yellow
    
} catch {
    Write-Error "Erro durante o deploy: $($_.Exception.Message)"
    Write-Host "Tente executar manualmente no servidor:" -ForegroundColor Yellow
    Write-Host $deployCommands -ForegroundColor Gray
} finally {
    # Limpar arquivo temporário
    Remove-Item $tempScript -ErrorAction SilentlyContinue
}

Write-Status "Script de deploy finalizado."