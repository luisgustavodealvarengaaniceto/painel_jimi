# 🔍 Script de Verificação - Novas Features (Windows)

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🔍 VERIFICANDO IMPLEMENTAÇÃO DAS NOVAS FEATURES" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Verificar se container está rodando
$containerRunning = docker ps --filter "name=jimi-app" --format "{{.Names}}"

if (-not $containerRunning) {
    Write-Host "❌ Container jimi-app não está rodando!" -ForegroundColor Red
    Write-Host "Execute: docker-compose up -d"
    exit 1
}

Write-Host "✅ Container está rodando" -ForegroundColor Green
Write-Host ""

# 1. Verificar se colunas existem no banco
Write-Host "1️⃣ Verificando colunas no banco de dados..." -ForegroundColor Blue

$columnsQuery = @"
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
"@

$columnsCheck = docker exec jimi-postgres psql -U painel_user -d painel_jimi -t -c $columnsQuery

if ($columnsCheck -match "expires_at_exists") {
    Write-Host "  ✅ Coluna expires_at existe" -ForegroundColor Green
} else {
    Write-Host "  ❌ Coluna expires_at NÃO existe" -ForegroundColor Red
    $hasMissingColumns = $true
}

if ($columnsCheck -match "is_archived_exists") {
    Write-Host "  ✅ Coluna is_archived existe" -ForegroundColor Green
} else {
    Write-Host "  ❌ Coluna is_archived NÃO existe" -ForegroundColor Red
    $hasMissingColumns = $true
}

if ($columnsCheck -match "table_exists") {
    Write-Host "  ✅ Tabela slide_attachments existe" -ForegroundColor Green
} else {
    Write-Host "  ❌ Tabela slide_attachments NÃO existe" -ForegroundColor Red
    $hasMissingColumns = $true
}

Write-Host ""

# 2. Verificar migrações aplicadas
Write-Host "2️⃣ Verificando migrações aplicadas..." -ForegroundColor Blue

$migrations = docker exec jimi-postgres psql -U painel_user -d painel_jimi -t -c "SELECT version FROM drizzle.__drizzle_migrations ORDER BY created_at;"

if ($migrations) {
    $migrations -split "`n" | Where-Object { $_.Trim() } | ForEach-Object {
        Write-Host "  ✅ Migração: $($_.Trim())" -ForegroundColor Green
    }
} else {
    Write-Host "  ⚠️  Nenhuma migração encontrada" -ForegroundColor Yellow
}

Write-Host ""

# 3. Verificar job de expiração
Write-Host "3️⃣ Verificando job de arquivamento..." -ForegroundColor Blue

$jobCheck = docker logs jimi-app 2>&1 | Select-String -Pattern "arquivado" | Select-Object -Last 3

if ($jobCheck) {
    Write-Host "  ✅ Job de arquivamento está ativo" -ForegroundColor Green
    $jobCheck | ForEach-Object { Write-Host "    $_" }
} else {
    Write-Host "  ⚠️  Nenhum log de arquivamento encontrado (normal se não há slides expirados)" -ForegroundColor Yellow
}

Write-Host ""

# 4. Verificar endpoints de anexos
Write-Host "4️⃣ Verificando endpoints de anexos..." -ForegroundColor Blue

$routesCheck = docker exec jimi-app cat dist/app.js | Select-String -Pattern "slideAttachments"

if ($routesCheck) {
    Write-Host "  ✅ Rotas de slideAttachments encontradas no código compilado" -ForegroundColor Green
} else {
    Write-Host "  ❌ Rotas de slideAttachments NÃO encontradas" -ForegroundColor Red
}

Write-Host ""

# 5. Verificar pasta de uploads
Write-Host "5️⃣ Verificando pasta de uploads..." -ForegroundColor Blue

$uploadsExists = docker exec jimi-app test -d /app/uploads 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Pasta /app/uploads existe" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Pasta /app/uploads não existe" -ForegroundColor Yellow
    Write-Host "  Criando pasta..."
    docker exec jimi-app mkdir -p /app/uploads | Out-Null
    Write-Host "  ✅ Pasta criada" -ForegroundColor Green
}

Write-Host ""

# 6. Testar API
Write-Host "6️⃣ Testando API de slides..." -ForegroundColor Blue

try {
    $apiResponse = Invoke-WebRequest -Uri "http://localhost:1212/api/slides" -UseBasicParsing -TimeoutSec 5
    $apiContent = $apiResponse.Content
    
    if ($apiContent -match "expiresAt") {
        Write-Host "  ✅ API retorna campo expiresAt" -ForegroundColor Green
        $hasExpiresAt = $true
    } else {
        Write-Host "  ❌ API NÃO retorna campo expiresAt" -ForegroundColor Red
    }
    
    if ($apiContent -match "isArchived") {
        Write-Host "  ✅ API retorna campo isArchived" -ForegroundColor Green
        $hasIsArchived = $true
    } else {
        Write-Host "  ❌ API NÃO retorna campo isArchived" -ForegroundColor Red
    }
} catch {
    Write-Host "  ❌ Erro ao testar API: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Diagnóstico final
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 DIAGNÓSTICO FINAL" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($hasMissingColumns) {
    Write-Host "❌ PROBLEMA IDENTIFICADO:" -ForegroundColor Red
    Write-Host "As colunas/tabelas não existem no banco de dados."
    Write-Host ""
    Write-Host "🔧 SOLUÇÃO:" -ForegroundColor Yellow
    Write-Host "Execute a migração manualmente:"
    Write-Host ""
    Write-Host "  docker exec jimi-app npm run db:migrate" -ForegroundColor White
    Write-Host ""
    Write-Host "Ou force o rebuild completo:"
    Write-Host ""
    Write-Host "  .\rebuild.ps1" -ForegroundColor White
    Write-Host ""
} elseif (-not $hasExpiresAt -or -not $hasIsArchived) {
    Write-Host "⚠️  PROBLEMA PARCIAL:" -ForegroundColor Yellow
    Write-Host "As colunas existem no banco mas a API não está retornando os novos campos."
    Write-Host ""
    Write-Host "🔧 SOLUÇÃO:" -ForegroundColor Yellow
    Write-Host "Reinicie o container:"
    Write-Host ""
    Write-Host "  docker-compose restart app" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "✅ TUDO OK! Novas features estão funcionando!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Features disponíveis:"
    Write-Host "  • Expiração automática de slides"
    Write-Host "  • Upload de anexos de imagens"
    Write-Host "  • Arquivamento de slides expirados"
    Write-Host ""
}
