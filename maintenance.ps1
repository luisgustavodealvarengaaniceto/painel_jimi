#!/usr/bin/env pwsh
# Script de Manutenção do Painel JIMI IOT Brasil
# 
# Uso: .\maintenance.ps1 [comando]
# 
# Comandos disponíveis:
#   status      - Mostra status de todos os containers
#   logs        - Mostra logs de todos os containers
#   restart-app - Reinicia apenas o container da aplicação
#   restart-nginx - Reinicia apenas o nginx
#   restart-all - Reinicia todos os containers
#   backup-db   - Faz backup do banco de dados
#   restore-db  - Restaura backup do banco de dados
#   update      - Atualiza e reinicia a aplicação
#   clean       - Remove containers e recria tudo

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("status", "logs", "restart-app", "restart-nginx", "restart-all", "backup-db", "restore-db", "update", "clean")]
    [string]$Action
)

$ErrorActionPreference = "Stop"

function Write-Status {
    param([string]$Message)
    Write-Host "🔧 $Message" -ForegroundColor Cyan
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

function Show-Status {
    Write-Status "Status dos containers JIMI IOT Brasil:"
    docker ps -a --filter "name=jimi-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    Write-Host "`n📊 Uso de recursos:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" $(docker ps --filter "name=jimi-" -q)
}

function Show-Logs {
    Write-Status "Logs dos containers (últimas 50 linhas):"
    
    Write-Host "`n🐘 PostgreSQL:"
    docker logs --tail 50 jimi-postgres
    
    Write-Host "`n🚀 Aplicação:"
    docker logs --tail 50 jimi-app
    
    Write-Host "`n🌐 Nginx:"
    docker logs --tail 50 jimi-nginx
}

function Restart-App {
    Write-Status "Reiniciando container da aplicação..."
    docker restart jimi-app
    
    # Aguarda container ficar healthy
    $timeout = 60
    $elapsed = 0
    do {
        Start-Sleep 2
        $elapsed += 2
        $status = docker inspect jimi-app --format '{{.State.Health.Status}}' 2>$null
        if ($status -eq "healthy") {
            Write-Success "Aplicação reiniciada com sucesso!"
            return
        }
    } while ($elapsed -lt $timeout)
    
    Write-Warning "Aplicação reiniciada, mas não conseguiu verificar health status"
}

function Restart-Nginx {
    Write-Status "Reiniciando container do Nginx..."
    docker restart jimi-nginx
    Start-Sleep 5
    
    # Testa se nginx está respondendo
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:1212" -TimeoutSec 10 -ErrorAction Stop
        Write-Success "Nginx reiniciado com sucesso!"
    } catch {
        Write-Warning "Nginx reiniciado, mas não está respondendo na porta 1212"
    }
}

function Restart-All {
    Write-Status "Reiniciando todos os containers..."
    docker-compose restart
    Write-Success "Todos os containers reiniciados!"
}

function Backup-Database {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFile = "backup_jimi_$timestamp.sql"
    
    Write-Status "Fazendo backup do banco de dados..."
    
    docker exec jimi-postgres pg_dump -U painel_user -d painel_jimi > $backupFile
    
    if (Test-Path $backupFile) {
        Write-Success "Backup criado: $backupFile"
        
        # Compacta o backup
        Compress-Archive -Path $backupFile -DestinationPath "$backupFile.zip"
        Remove-Item $backupFile
        Write-Success "Backup compactado: $backupFile.zip"
    } else {
        Write-Error "Falha ao criar backup!"
    }
}

function Restore-Database {
    $backupFiles = Get-ChildItem -Filter "backup_jimi_*.sql.zip" | Sort-Object LastWriteTime -Descending
    
    if ($backupFiles.Count -eq 0) {
        Write-Error "Nenhum arquivo de backup encontrado!"
        return
    }
    
    Write-Host "Backups disponíveis:"
    for ($i = 0; $i -lt $backupFiles.Count; $i++) {
        Write-Host "$($i + 1). $($backupFiles[$i].Name) - $($backupFiles[$i].LastWriteTime)"
    }
    
    $choice = Read-Host "Escolha o backup para restaurar (1-$($backupFiles.Count))"
    $selectedBackup = $backupFiles[$choice - 1]
    
    if (-not $selectedBackup) {
        Write-Error "Seleção inválida!"
        return
    }
    
    Write-Warning "⚠️  Esta operação irá SOBRESCREVER todos os dados atuais!"
    $confirm = Read-Host "Tem certeza? Digite 'CONFIRMO' para continuar"
    
    if ($confirm -ne "CONFIRMO") {
        Write-Status "Operação cancelada."
        return
    }
    
    Write-Status "Restaurando backup: $($selectedBackup.Name)"
    
    # Descompacta o backup
    Expand-Archive -Path $selectedBackup.FullName -DestinationPath "." -Force
    $sqlFile = $selectedBackup.Name -replace "\.zip$", ""
    
    # Restaura o banco
    docker exec -i jimi-postgres psql -U painel_user -d painel_jimi < $sqlFile
    
    # Remove arquivo temporário
    Remove-Item $sqlFile
    
    Write-Success "Backup restaurado com sucesso!"
}

function Update-Application {
    Write-Status "Atualizando aplicação..."
    
    # Para containers de app e nginx
    docker stop jimi-app jimi-nginx
    
    # Reconstrói a aplicação
    docker-compose build app
    
    # Reinicia os serviços
    docker-compose up -d app nginx
    
    Write-Success "Aplicação atualizada!"
    
    # Mostra status
    Show-Status
}

function Clean-Environment {
    Write-Warning "⚠️  Esta operação irá remover TODOS os containers e recriá-los!"
    Write-Warning "⚠️  Os dados do banco serão PRESERVADOS nos volumes."
    $confirm = Read-Host "Tem certeza? Digite 'LIMPAR' para continuar"
    
    if ($confirm -ne "LIMPAR") {
        Write-Status "Operação cancelada."
        return
    }
    
    Write-Status "Parando e removendo containers..."
    docker-compose down
    
    Write-Status "Removendo imagens antigas..."
    docker rmi $(docker images --filter "reference=painel_jimi*" -q) -f 2>$null
    
    Write-Status "Recriando ambiente..."
    docker-compose up -d --build
    
    Write-Success "Ambiente limpo e recriado!"
}

# Executa a ação solicitada
switch ($Action) {
    "status" { Show-Status }
    "logs" { Show-Logs }
    "restart-app" { Restart-App }
    "restart-nginx" { Restart-Nginx }
    "restart-all" { Restart-All }
    "backup-db" { Backup-Database }
    "restore-db" { Restore-Database }
    "update" { Update-Application }
    "clean" { Clean-Environment }
}