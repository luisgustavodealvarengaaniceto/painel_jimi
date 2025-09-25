# Script de diagnóstico para JIMI IOT Dashboard - Windows PowerShell
# Execute este script se tiver problemas com o Docker

Write-Host "🔍 JIMI IOT Dashboard - Diagnóstico Docker" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Docker está rodando
Write-Host "📦 Verificando Docker..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✅ Docker está rodando" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não está rodando ou não está instalado" -ForegroundColor Red
    exit 1
}

# Verificar se Docker Compose está disponível
Write-Host ""
Write-Host "📦 Verificando Docker Compose..." -ForegroundColor Yellow
try {
    docker compose version | Out-Null
    Write-Host "✅ Docker Compose está disponível" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose não está disponível" -ForegroundColor Red
    exit 1
}

# Verificar portas
Write-Host ""
Write-Host "🔌 Verificando portas..." -ForegroundColor Yellow

$port1212 = netstat -an | Select-String ":1212"
if ($port1212) {
    Write-Host "⚠️  Porta 1212 está em uso" -ForegroundColor Red
    Write-Host "   Execute: docker compose down" -ForegroundColor Yellow
} else {
    Write-Host "✅ Porta 1212 está livre" -ForegroundColor Green
}

$port5432 = netstat -an | Select-String ":5432"
if ($port5432) {
    Write-Host "⚠️  Porta 5432 (PostgreSQL) está em uso" -ForegroundColor Red
    Write-Host "   Verifique se há outro PostgreSQL rodando" -ForegroundColor Yellow
} else {
    Write-Host "✅ Porta 5432 está livre" -ForegroundColor Green
}

# Verificar containers
Write-Host ""
Write-Host "🐳 Status dos containers..." -ForegroundColor Yellow
try {
    docker compose ps
} catch {
    Write-Host "❌ Nenhum container do projeto está rodando" -ForegroundColor Red
    Write-Host "   Execute: docker compose up -d" -ForegroundColor Yellow
}

# Verificar recursos do sistema
Write-Host ""
Write-Host "💾 Recursos do sistema..." -ForegroundColor Yellow
$memory = Get-CimInstance -ClassName Win32_OperatingSystem
$totalMemory = [math]::Round($memory.TotalVisibleMemorySize / 1MB, 2)
$freeMemory = [math]::Round($memory.FreePhysicalMemory / 1MB, 2)
Write-Host "Memória Total: $totalMemory GB"
Write-Host "Memória Livre: $freeMemory GB"

$disk = Get-CimInstance -ClassName Win32_LogicalDisk -Filter "DeviceID='C:'"
$totalSpace = [math]::Round($disk.Size / 1GB, 2)
$freeSpace = [math]::Round($disk.FreeSpace / 1GB, 2)
Write-Host "Espaço em disco C: - Total: $totalSpace GB, Livre: $freeSpace GB"

# Verificar logs recentes se containers estão rodando
Write-Host ""
Write-Host "📋 Logs recentes (últimas 10 linhas)..." -ForegroundColor Yellow

$containers = docker compose ps --format "{{.Service}}" 2>$null
if ($containers -contains "app") {
    Write-Host "--- Logs do App ---" -ForegroundColor Cyan
    docker compose logs --tail 10 app
    Write-Host ""
    Write-Host "--- Logs do Nginx ---" -ForegroundColor Cyan
    docker compose logs --tail 10 nginx
    Write-Host ""
    Write-Host "--- Logs do PostgreSQL ---" -ForegroundColor Cyan
    docker compose logs --tail 10 postgres
} else {
    Write-Host "⚠️  Containers não estão rodando" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔧 Comandos para resolver problemas comuns:" -ForegroundColor Yellow
Write-Host ""
Write-Host "# Reconstruir tudo do zero:" -ForegroundColor Cyan
Write-Host "docker compose down -v" -ForegroundColor White
Write-Host "docker compose up --build -d" -ForegroundColor White
Write-Host ""
Write-Host "# Ver logs em tempo real:" -ForegroundColor Cyan
Write-Host "docker compose logs -f" -ForegroundColor White
Write-Host ""
Write-Host "# Reiniciar apenas o app:" -ForegroundColor Cyan
Write-Host "docker compose restart app" -ForegroundColor White
Write-Host ""
Write-Host "# Verificar conectividade do banco:" -ForegroundColor Cyan
Write-Host "docker compose exec postgres pg_isready -U painel_user -d painel_jimi" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 Se tudo estiver OK, acesse: http://localhost:1212" -ForegroundColor Green
Write-Host "👤 Login: admin / admin123" -ForegroundColor Green