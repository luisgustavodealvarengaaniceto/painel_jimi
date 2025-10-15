Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEPLOY COMPLETO - FRONTEND ATUALIZADO " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Build realizado: dist/index-WdnwY5Qr.js (755KB)" -ForegroundColor Green
Write-Host "✓ Arquivos copiados para nginx: 16:38" -ForegroundColor Green
Write-Host "✓ Nginx recarregado com no-cache headers" -ForegroundColor Green
Write-Host "✓ AKROZ TELEMATICS encontrado no bundle" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "COMO TESTAR:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. FECHE todas as abas do localhost" -ForegroundColor White
Write-Host "2. Abra em MODO INCÓGNITO (Ctrl+Shift+N)" -ForegroundColor White
Write-Host "3. Acesse: http://localhost" -ForegroundColor White
Write-Host ""
Write-Host "TESTES:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Login: admin / admin123" -ForegroundColor Cyan
Write-Host "  → Deve ver: 'JIMI IOT BRASIL' (azul claro)" -ForegroundColor Gray
Write-Host ""
Write-Host "  Login: akroz / akroz123" -ForegroundColor Cyan
Write-Host "  → Deve ver: 'AKROZ TELEMATICS' (azul escuro)" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Abrindo navegador..." -ForegroundColor Yellow

# Tentar abrir em modo incógnito
$chromeFound = Test-Path "C:\Program Files\Google\Chrome\Application\chrome.exe"
$edgeFound = Test-Path "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

if ($chromeFound) {
    Start-Process "C:\Program Files\Google\Chrome\Application\chrome.exe" -ArgumentList "--incognito", "http://localhost"
    Write-Host "✓ Chrome aberto em modo incógnito" -ForegroundColor Green
} elseif ($edgeFound) {
    Start-Process "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" -ArgumentList "--inprivate", "http://localhost"
    Write-Host "✓ Edge aberto em modo InPrivate" -ForegroundColor Green
} else {
    Start-Process "http://localhost"
    Write-Host "⚠ Navegador padrão aberto - LIMPE O CACHE (Ctrl+Shift+Delete)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "DEBUG: Abra o Console (F12) e procure por:" -ForegroundColor DarkGray
Write-Host "  [DynamicThemeProvider] Theme: akroz AKROZ TELEMATICS" -ForegroundColor DarkGray
Write-Host ""
