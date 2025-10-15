Write-Host "🚀 BUILD RÁPIDO PARA DESENVOLVIMENTO" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# 1. Build apenas do frontend
Write-Host "1. Building frontend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Erro no build do frontend!" -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ Frontend build concluído" -ForegroundColor Green

# 2. Limpar nginx e deployar nova versão
Write-Host "2. Atualizando nginx..." -ForegroundColor Yellow
try {
    docker exec jimi-nginx rm -rf /usr/share/nginx/html/*
    docker cp .\dist\. jimi-nginx:/usr/share/nginx/html/
    docker exec jimi-nginx nginx -s reload
    Write-Host "   ✅ Frontend atualizado no nginx" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Erro ao atualizar nginx!" -ForegroundColor Red
    Write-Host "   💡 Tente executar o rebuild completo: .\rebuild.ps1" -ForegroundColor Yellow
    exit 1
}

# 3. Verificar status
Write-Host "3. Verificando containers..." -ForegroundColor Yellow
docker-compose ps

# 4. Testar se frontend está funcionando
Write-Host "4. Testando frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:1212" -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Frontend está funcionando!" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️ Frontend pode estar carregando..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ ATUALIZAÇÃO RÁPIDA CONCLUÍDA!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host "🌐 Acesse: http://localhost:1212" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Para rebuild completo (backend + DB):" -ForegroundColor White
Write-Host "   .\rebuild.ps1" -ForegroundColor Gray
Write-Host "====================================" -ForegroundColor Cyan