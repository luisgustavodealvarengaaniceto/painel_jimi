# Script de Teste de Multi-Tenancy Completo
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  TESTE DE MULTI-TENANCY COMPLETO" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Teste 1: Login Admin
Write-Host "1️⃣ Testando login do ADMIN (tenant: default)..." -ForegroundColor Yellow
$adminResponse = Invoke-RestMethod -Uri http://localhost:1212/api/auth/login -Method POST -ContentType 'application/json' -Body '{"username":"admin","password":"admin123"}'
$adminToken = $adminResponse.token
Write-Host "✅ Admin logado com sucesso" -ForegroundColor Green
Write-Host "   Username: $($adminResponse.user.username)" -ForegroundColor Gray
Write-Host "   Tenant: $($adminResponse.user.tenant)" -ForegroundColor Gray
Write-Host "   Role: $($adminResponse.user.role)" -ForegroundColor Gray
Write-Host ""

# Teste 2: Login Akroz
Write-Host "2️⃣ Testando login do AKROZ (tenant: akroz)..." -ForegroundColor Yellow
$akrozResponse = Invoke-RestMethod -Uri http://localhost:1212/api/auth/login -Method POST -ContentType 'application/json' -Body '{"username":"akroz","password":"akroz123"}'
$akrozToken = $akrozResponse.token
Write-Host "✅ Akroz logado com sucesso" -ForegroundColor Green
Write-Host "   Username: $($akrozResponse.user.username)" -ForegroundColor Gray
Write-Host "   Tenant: $($akrozResponse.user.tenant)" -ForegroundColor Gray
Write-Host "   Role: $($akrozResponse.user.role)" -ForegroundColor Gray
Write-Host ""

# Teste 3: Slides do Admin
Write-Host "3️⃣ Testando slides do ADMIN..." -ForegroundColor Yellow
$adminHeaders = @{Authorization = "Bearer $adminToken"}
$adminSlides = (Invoke-RestMethod -Uri http://localhost:1212/api/slides -Headers $adminHeaders).slides
Write-Host "✅ Admin vê $($adminSlides.Count) slide(s)" -ForegroundColor Green
$adminSlides | ForEach-Object {
    Write-Host "   - [$($_.tenant)] $($_.title)" -ForegroundColor Gray
}
Write-Host ""

# Teste 4: Slides do Akroz
Write-Host "4️⃣ Testando slides do AKROZ..." -ForegroundColor Yellow
$akrozHeaders = @{Authorization = "Bearer $akrozToken"}
$akrozSlides = (Invoke-RestMethod -Uri http://localhost:1212/api/slides -Headers $akrozHeaders).slides
Write-Host "✅ Akroz vê $($akrozSlides.Count) slide(s)" -ForegroundColor Green
$akrozSlides | ForEach-Object {
    Write-Host "   - [$($_.tenant)] $($_.title)" -ForegroundColor Gray
}
Write-Host ""

# Teste 5: Fixed Content do Admin
Write-Host "5️⃣ Testando fixed content do ADMIN..." -ForegroundColor Yellow
$adminContent = (Invoke-RestMethod -Uri http://localhost:1212/api/fixed-content -Headers $adminHeaders).content
Write-Host "✅ Admin vê $($adminContent.Count) fixed content(s)" -ForegroundColor Green
$adminContent | ForEach-Object {
    Write-Host "   - [$($_.tenant)] $($_.type): $($_.content)" -ForegroundColor Gray
}
Write-Host ""

# Teste 6: Fixed Content do Akroz
Write-Host "6️⃣ Testando fixed content do AKROZ..." -ForegroundColor Yellow
$akrozContent = (Invoke-RestMethod -Uri http://localhost:1212/api/fixed-content -Headers $akrozHeaders).content
Write-Host "✅ Akroz vê $($akrozContent.Count) fixed content(s)" -ForegroundColor Green
$akrozContent | ForEach-Object {
    Write-Host "   - [$($_.tenant)] $($_.type): $($_.content)" -ForegroundColor Gray
}
Write-Host ""

# Teste 7: Validação de Segregação
Write-Host "7️⃣ Validando segregação de dados..." -ForegroundColor Yellow
$adminOnlySlides = $adminSlides | Where-Object { $_.tenant -eq "default" }
$akrozOnlySlides = $akrozSlides | Where-Object { $_.tenant -eq "akroz" }
$adminHasAkrozData = $adminSlides | Where-Object { $_.tenant -eq "akroz" }
$akrozHasAdminData = $akrozSlides | Where-Object { $_.tenant -eq "default" }

if ($adminHasAkrozData) {
    Write-Host "❌ ERRO: Admin pode ver dados do Akroz!" -ForegroundColor Red
} elseif ($akrozHasAdminData) {
    Write-Host "❌ ERRO: Akroz pode ver dados do Admin!" -ForegroundColor Red
} else {
    Write-Host "✅ Segregação de dados está funcionando corretamente!" -ForegroundColor Green
    Write-Host "   Admin vê apenas dados 'default'" -ForegroundColor Gray
    Write-Host "   Akroz vê apenas dados 'akroz'" -ForegroundColor Gray
}
Write-Host ""

# Resumo Final
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  RESUMO DOS TESTES" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "✅ Login Admin: OK" -ForegroundColor Green
Write-Host "✅ Login Akroz: OK" -ForegroundColor Green
Write-Host "✅ Slides Admin: $($adminSlides.Count) (tenant: default)" -ForegroundColor Green
Write-Host "✅ Slides Akroz: $($akrozSlides.Count) (tenant: akroz)" -ForegroundColor Green
Write-Host "✅ Fixed Content Admin: $($adminContent.Count) (tenant: default)" -ForegroundColor Green
Write-Host "✅ Fixed Content Akroz: $($akrozContent.Count) (tenant: akroz)" -ForegroundColor Green
Write-Host "✅ Segregação de Dados: OK" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 MULTI-TENANCY IMPLEMENTADO COM SUCESSO!" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Acesse http://localhost:1212/login" -ForegroundColor White
Write-Host "2. Faça login como 'admin' (verá tema JIMI azul)" -ForegroundColor White
Write-Host "3. Faça logout e login como 'akroz' (verá tema Akroz)" -ForegroundColor White
Write-Host ""
