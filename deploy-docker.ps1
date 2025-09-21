# JIMI IOT BRASIL - Docker Deploy Script (PowerShell)
# Execução: .\deploy-docker.ps1

param(
    [switch]$Clean,
    [switch]$Logs,
    [switch]$Help
)

Write-Host "🐳 JIMI IOT BRASIL - Docker Deploy Script (PowerShell)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

function Write-Log {
    param($Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] ⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] ❌ $Message" -ForegroundColor Red
}

function Show-Help {
    Write-Host "Uso: .\deploy-docker.ps1 [opções]"
    Write-Host ""
    Write-Host "Opções:"
    Write-Host "  -Clean      Limpar volumes e imagens antigas antes do deploy"
    Write-Host "  -Logs       Mostrar logs após o deploy"
    Write-Host "  -Help       Mostrar esta ajuda"
    Write-Host ""
    Write-Host "Exemplos:"
    Write-Host "  .\deploy-docker.ps1              Deploy normal"
    Write-Host "  .\deploy-docker.ps1 -Clean       Deploy com limpeza"
    Write-Host "  .\deploy-docker.ps1 -Logs        Deploy e mostrar logs"
    Write-Host "  .\deploy-docker.ps1 -Clean -Logs Deploy com limpeza e logs"
}

function Test-Dependencies {
    Write-Log "Verificando dependências..."
    
    try {
        docker --version | Out-Null
        docker-compose --version | Out-Null
        Write-Log "✅ Docker e Docker Compose encontrados"
    }
    catch {
        Write-Error "Docker ou Docker Compose não encontrados!"
        Write-Host "Instale Docker Desktop: https://www.docker.com/products/docker-desktop/"
        exit 1
    }
}

function Test-EnvFile {
    Write-Log "Verificando arquivo de environment..."
    
    if (-not (Test-Path ".env.docker")) {
        Write-Warning "Arquivo .env.docker não encontrado. Criando arquivo padrão..."
        
        $envContent = @"
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
"@
        
        $envContent | Out-File -FilePath ".env.docker" -Encoding UTF8
        Write-Log "✅ Arquivo .env.docker criado com valores padrão"
        Write-Warning "⚠️  Altere as senhas em .env.docker antes de usar em produção!"
    }
    else {
        Write-Log "✅ Arquivo .env.docker encontrado"
    }
}

function Stop-ExistingContainers {
    Write-Log "Parando containers existentes..."
    
    try {
        $containers = docker-compose ps --services
        if ($containers) {
            docker-compose down
            Write-Log "✅ Containers parados"
        }
        else {
            Write-Log "ℹ️  Nenhum container rodando"
        }
    }
    catch {
        Write-Log "ℹ️  Nenhum container rodando"
    }
}

function Invoke-Cleanup {
    if ($Clean) {
        Write-Log "Limpando volumes e imagens antigas..."
        
        docker volume prune -f
        docker image prune -f
        
        Write-Log "✅ Limpeza concluída"
    }
}

function Build-Images {
    Write-Log "Construindo imagens Docker..."
    
    docker-compose build --parallel
    
    if ($LASTEXITCODE -eq 0) {
        Write-Log "✅ Imagens construídas com sucesso"
    }
    else {
        Write-Error "Falha ao construir imagens"
        exit 1
    }
}

function Start-Services {
    Write-Log "Iniciando serviços..."
    
    docker-compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Log "✅ Serviços iniciados"
    }
    else {
        Write-Error "Falha ao iniciar serviços"
        exit 1
    }
}

function Wait-ForHealth {
    Write-Log "Aguardando serviços ficarem saudáveis..."
    
    $maxAttempts = 30
    $attempt = 0
    
    while ($attempt -lt $maxAttempts) {
        $unhealthy = docker-compose ps | Select-String "unhealthy"
        if ($unhealthy) {
            Write-Warning "Alguns serviços ainda não estão saudáveis... ($($attempt + 1)/$maxAttempts)"
            Start-Sleep 10
            $attempt++
        }
        else {
            Write-Log "✅ Todos os serviços estão saudáveis"
            return
        }
    }
    
    Write-Error "Timeout: Serviços não ficaram saudáveis em tempo hábil"
    docker-compose logs
    exit 1
}

function Invoke-Migrations {
    Write-Log "Executando migrações do banco de dados..."
    
    Start-Sleep 5
    
    docker-compose exec -T app npm run migrate
    docker-compose exec -T app npm run seed
    
    Write-Log "✅ Migrações e seed executados"
}

function Show-Status {
    Write-Log "Status dos serviços:"
    docker-compose ps
    
    Write-Host ""
    Write-Log "🌐 URLs de acesso:"
    Write-Host "   Admin:   http://localhost:1212/admin"
    Write-Host "   Display: http://localhost:1212/display"
    Write-Host "   Login:   http://localhost:1212/login"
    Write-Host ""
    Write-Log "🔑 Credenciais padrão:"
    Write-Host "   Usuário: admin"
    Write-Host "   Senha:   admin123"
    Write-Host ""
    Write-Warning "⚠️  IMPORTANTE: Altere a senha após o primeiro login!"
}

function Show-Logs {
    if ($Logs) {
        Write-Log "Mostrando logs dos serviços..."
        docker-compose logs -f
    }
}

# Função principal
function Main {
    if ($Help) {
        Show-Help
        return
    }
    
    Test-Dependencies
    Test-EnvFile
    Stop-ExistingContainers
    Invoke-Cleanup
    Build-Images
    Start-Services
    Wait-ForHealth
    Invoke-Migrations
    Show-Status
    Show-Logs
    
    Write-Log "🎉 Deploy do JIMI IOT BRASIL concluído com sucesso!"
}

# Executar
try {
    Main
}
catch {
    Write-Error "Deploy falhou: $($_.Exception.Message)"
    exit 1
}
