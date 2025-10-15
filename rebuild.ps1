Write-Host "🐳 REBUILD COMPLETO DO DOCKER COMPOSE" -ForegroundColor CyanWrite-Host "🐳 REBUILD COMPLETO DO DOCKER COMPOSE" -ForegroundColor Cyan

Write-Host "=====================================" -ForegroundColor CyanWrite-Host "=====================================" -ForegroundColor Cyan



# 1. Parar todos os containers# 1. Parar todos os containers

Write-Host "1. Parando containers..." -ForegroundColor YellowWrite-Host "1. Parando containers..." -ForegroundColor Yellow

docker-compose downdocker-compose down



# 2. Remover containers, redes, volumes e imagens órfãs# 2. Remover containers, redes, volumes e imagens órfãs

Write-Host "2. Limpando recursos antigos..." -ForegroundColor YellowWrite-Host "2. Limpando recursos antigos..." -ForegroundColor Yellow

docker-compose down --volumes --remove-orphansdocker-compose down --volumes --remove-orphans

docker system prune -fdocker system prune -f



# 3. Remover imagens específicas do projeto# 3. Remover imagens específicas do projeto

Write-Host "3. Removendo imagens antigas..." -ForegroundColor YellowWrite-Host "3. Removendo imagens antigas..." -ForegroundColor Yellow

try {try {

    docker rmi painel_jimi-app -f 2>$null    docker rmi painel_jimi-app -f 2>$null

    Write-Host "   ✅ Imagem painel_jimi-app removida" -ForegroundColor Green    Write-Host "   ✅ Imagem painel_jimi-app removida" -ForegroundColor Green

}} catch {

catch {    Write-Host "   ⚠️ Imagem painel_jimi-app não encontrada" -ForegroundColor Gray

    Write-Host "   ⚠️ Imagem painel_jimi-app não encontrada" -ForegroundColor Gray}

}

try {

try {    docker rmi painel_jimi-nginx -f 2>$null

    docker rmi painel_jimi-nginx -f 2>$null    Write-Host "   ✅ Imagem painel_jimi-nginx removida" -ForegroundColor Green

    Write-Host "   ✅ Imagem painel_jimi-nginx removida" -ForegroundColor Green} catch {

}    Write-Host "   ⚠️ Imagem painel_jimi-nginx não encontrada" -ForegroundColor Gray

catch {}

    Write-Host "   ⚠️ Imagem painel_jimi-nginx não encontrada" -ForegroundColor Gray

}# 4. Remover volume do PostgreSQL (força recriação do banco com migrações)

Write-Host "4. Removendo volume do PostgreSQL..." -ForegroundColor Yellow

# 4. Remover volume do PostgreSQL (força recriação do banco com migrações)try {

Write-Host "4. Removendo volume do PostgreSQL..." -ForegroundColor Yellow    docker volume rm painel_jimi_postgres_data -f 2>$null

try {    Write-Host "   ✅ Volume PostgreSQL removido (banco será recriado com font_size)" -ForegroundColor Green

    docker volume rm painel_jimi_postgres_data -f 2>$null} catch {

    Write-Host "   ✅ Volume PostgreSQL removido (banco será recriado com font_size)" -ForegroundColor Green    Write-Host "   ⚠️ Volume PostgreSQL não encontrado" -ForegroundColor Gray

}}

catch {

    Write-Host "   ⚠️ Volume PostgreSQL não encontrado" -ForegroundColor Gray# 5. Limpar pasta dist se existir

}Write-Host "5. Limpando build anterior..." -ForegroundColor Yellow

if (Test-Path "dist") {

# 5. Limpar pasta dist se existir    Remove-Item -Recurse -Force "dist"

Write-Host "5. Limpando build anterior..." -ForegroundColor Yellow    Write-Host "   ✅ Pasta dist removida" -ForegroundColor Green

if (Test-Path "dist") {} else {

    Remove-Item -Recurse -Force "dist"    Write-Host "   ⚠️ Pasta dist não encontrada" -ForegroundColor Gray

    Write-Host "   ✅ Pasta dist removida" -ForegroundColor Green}

}

else {# 6. Instalar dependências do frontend (caso tenham mudado)

    Write-Host "   ⚠️ Pasta dist não encontrada" -ForegroundColor GrayWrite-Host "6. Verificando dependências do frontend..." -ForegroundColor Yellow

}npm install

if ($LASTEXITCODE -ne 0) {

# 6. Build do frontend    Write-Host "   ❌ Erro ao instalar dependências do frontend!" -ForegroundColor Red

Write-Host "6. Building frontend..." -ForegroundColor Yellow    exit 1

npm run build}

if ($LASTEXITCODE -ne 0) {Write-Host "   ✅ Dependências do frontend atualizadas" -ForegroundColor Green

    Write-Host "   ❌ Erro no build do frontend!" -ForegroundColor Red

    exit 1# 7. Instalar dependências do backend

}Write-Host "7. Verificando dependências do backend..." -ForegroundColor Yellow

Write-Host "   ✅ Frontend build concluído" -ForegroundColor GreenSet-Location "backend"

npm install

# 7. Build e start dos containersif ($LASTEXITCODE -ne 0) {

Write-Host "7. Building e iniciando containers..." -ForegroundColor Yellow    Write-Host "   ❌ Erro ao instalar dependências do backend!" -ForegroundColor Red

Write-Host "   📦 Isso pode demorar alguns minutos..." -ForegroundColor Gray    Set-Location ".."

docker-compose up --build -d    exit 1

}

if ($LASTEXITCODE -ne 0) {Set-Location ".."

    Write-Host "   ❌ Erro ao buildar containers!" -ForegroundColor RedWrite-Host "   ✅ Dependências do backend atualizadas" -ForegroundColor Green

    Write-Host "   📋 Verificando logs..." -ForegroundColor Yellow

    docker-compose logs# 8. Build do frontend

    exit 1Write-Host "8. Building frontend..." -ForegroundColor Yellow

}npm run build

if ($LASTEXITCODE -ne 0) {

# 8. Aguardar containers ficarem prontos    Write-Host "   ❌ Erro no build do frontend!" -ForegroundColor Red

Write-Host "8. Aguardando containers ficarem prontos..." -ForegroundColor Yellow    exit 1

Start-Sleep -Seconds 20}

Write-Host "   ✅ Frontend build concluído" -ForegroundColor Green

# 9. Verificar status final

Write-Host "9. Status final dos containers:" -ForegroundColor Yellow# 9. Build e start dos containers

docker-compose psWrite-Host "9. Building e iniciando containers..." -ForegroundColor Yellow

Write-Host "   📦 Isso pode demorar alguns minutos..." -ForegroundColor Gray

Write-Host ""docker-compose up --build -d

Write-Host "🎉 REBUILD COMPLETO FINALIZADO!" -ForegroundColor Green

Write-Host "=====================================" -ForegroundColor Greenif ($LASTEXITCODE -ne 0) {

Write-Host "🌐 Frontend: http://localhost:1212" -ForegroundColor Cyan    Write-Host "   ❌ Erro ao buildar containers!" -ForegroundColor Red

Write-Host "🔧 API: http://localhost:3001/api" -ForegroundColor Cyan    Write-Host "   📋 Verificando logs..." -ForegroundColor Yellow

Write-Host "🗄️ PostgreSQL: localhost:5433" -ForegroundColor Cyan    docker-compose logs

Write-Host ""    exit 1

Write-Host "📝 Próximos passos:" -ForegroundColor White}

Write-Host "   1. Acesse http://localhost:1212" -ForegroundColor Gray

Write-Host "   2. Faça login com: admin/admin123 ou akroz/akroz123" -ForegroundColor Gray# 10. Aguardar containers ficarem saudáveis

Write-Host "   3. Teste a funcionalidade de tabelas Excel" -ForegroundColor GrayWrite-Host "10. Aguardando containers ficarem prontos..." -ForegroundColor Yellow

Write-Host ""Start-Sleep -Seconds 15

Write-Host "🔍 Para monitorar logs:" -ForegroundColor White

Write-Host "   docker-compose logs -f" -ForegroundColor Gray# 11. Verificar se PostgreSQL está rodando

Write-Host "=====================================" -ForegroundColor CyanWrite-Host "11. Verificando PostgreSQL..." -ForegroundColor Yellow
$postgresOk = $false
for ($i = 1; $i -le 10; $i++) {
    $status = docker exec jimi-postgres pg_isready -U painel_user -d painel_jimi 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ PostgreSQL está pronto!" -ForegroundColor Green
        $postgresOk = $true
        break
    } else {
        Write-Host "   ⏳ Aguardando PostgreSQL... (tentativa $i/10)" -ForegroundColor Gray
        Start-Sleep -Seconds 3
    }
}

if (-not $postgresOk) {
    Write-Host "   ❌ PostgreSQL não ficou pronto a tempo!" -ForegroundColor Red
    Write-Host "   📋 Logs do PostgreSQL:" -ForegroundColor Yellow
    docker-compose logs jimi-postgres
    exit 1
}

# 12. Verificar se backend está rodando
Write-Host "12. Verificando Backend..." -ForegroundColor Yellow
$backendOk = $false
for ($i = 1; $i -le 10; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✅ Backend está respondendo!" -ForegroundColor Green
            $backendOk = $true
            break
        }
    } catch {
        Write-Host "   ⏳ Aguardando Backend... (tentativa $i/10)" -ForegroundColor Gray
        Start-Sleep -Seconds 3
    }
}

if (-not $backendOk) {
    Write-Host "   ⚠️ Backend pode não estar totalmente pronto, mas continuando..." -ForegroundColor Yellow
    Write-Host "   📋 Logs do Backend:" -ForegroundColor Yellow
    docker-compose logs jimi-app | Select-Object -Last 20
}

# 13. Verificar status final
Write-Host "13. Status final dos containers:" -ForegroundColor Yellow
docker-compose ps

# 14. Testar endpoints principais
Write-Host "14. Testando endpoints..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:1212/api/health" -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host "   ✅ API Health check: OK" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️ API Health check: Falhou (pode estar inicializando)" -ForegroundColor Yellow
}

try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:1212" -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "   ✅ Frontend: OK" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️ Frontend: Falhou" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 REBUILD COMPLETO FINALIZADO!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:1212" -ForegroundColor Cyan
Write-Host "🔧 API: http://localhost:3001/api" -ForegroundColor Cyan
Write-Host "🗄️ PostgreSQL: localhost:5433" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Próximos passos:" -ForegroundColor White
Write-Host "   1. Acesse http://localhost:1212" -ForegroundColor Gray
Write-Host "   2. Faça login com: admin/admin123 ou akroz/akroz123" -ForegroundColor Gray
Write-Host "   3. Teste a funcionalidade de tabelas Excel" -ForegroundColor Gray
Write-Host ""
Write-Host "🔍 Para monitorar logs:" -ForegroundColor White
Write-Host "   docker-compose logs -f" -ForegroundColor Gray
Write-Host "=====================================" -ForegroundColor Cyan