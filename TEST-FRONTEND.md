# 🧪 Comandos para Testar o Frontend Atualizado

## 📋 Checklist Rápido

### 1️⃣ Verificar se containers estão rodando
```powershell
docker ps --filter "name=jimi" --format "table {{.Names}}\t{{.Status}}"
```

**Deve mostrar:**
```
NAMES           STATUS
jimi-nginx      Up X minutes (healthy)
jimi-app        Up X minutes (healthy)
jimi-postgres   Up X minutes (healthy)
```

---

### 2️⃣ Verificar arquivos do frontend no container
```powershell
# Ver se o index.html foi copiado
docker exec jimi-app ls -la /app/frontend/

# Ver se os assets foram buildados
docker exec jimi-app ls -la /app/frontend/assets/
```

**Deve mostrar:**
```
index.html
vite.svg
assets/
  index-XXXXX.js     ← JavaScript compilado
  index-XXXXX.css    ← CSS compilado
```

---

### 3️⃣ Verificar se o JavaScript compilado tem as novas features
```powershell
# Procurar por "expiresAt" no código compilado
docker exec jimi-app grep -o "expiresAt" /app/frontend/assets/*.js | head -5

# Procurar por "Data de Expiração" no código
docker exec jimi-app grep -o "Data de Expira" /app/frontend/assets/*.js | head -5

# Procurar por componentes de upload
docker exec jimi-app grep -o "imageUpload\|FileUploadArea" /app/frontend/assets/*.js | head -5
```

**Se retornar resultados = Frontend tem as features! ✅**

---

### 4️⃣ Testar API (backend já sabemos que funciona)
```powershell
(Invoke-WebRequest -Uri "http://localhost:1212/api/slides" -UseBasicParsing).Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
```

**Deve retornar:**
```json
{
  "slides": [
    {
      "id": "1",
      "title": "...",
      "expiresAt": null,      ← DEVE TER
      "isArchived": false,    ← DEVE TER
      ...
    }
  ]
}
```

---

### 5️⃣ Verificar logs do container
```powershell
docker logs jimi-app --tail=50
```

**Deve mostrar:**
```
✅ PostgreSQL conectado!
📊 Executando migrações com Drizzle...
🌱 Executando seed...
ℹ️ Seed já executado anteriormente
⏰ Job de arquivamento de slides iniciado
🚀 JIMI IOT Brasil Dashboard API running on port 3001
```

---

### 6️⃣ Verificar nginx (se frontend está sendo servido)
```powershell
docker logs jimi-nginx --tail=20
```

**Deve mostrar requisições como:**
```
GET /admin HTTP/1.1" 200
GET /assets/index-XXXXX.js HTTP/1.1" 200
GET /assets/index-XXXXX.css HTTP/1.1" 200
GET /api/slides HTTP/1.1" 200 ou 304
```

---

### 7️⃣ Testar diretamente no navegador

**Abra:** http://localhost:1212/admin

**Faça:**
1. Login com `admin` / `admin123`
2. Clique em "Slides"
3. Clique em "Novo Slide"

**O que você DEVE ver:**
```
┌─────────────────────────────────────────┐
│ Título *                                 │
├─────────────────────────────────────────┤
│ Conteúdo *                               │
├─────────────────────────────────────────┤
│ Duração     Ordem                        │
├─────────────────────────────────────────┤
│ 📅 Data de Expiração (opcional)  ← NOVO! │
│ [____________________]                   │
├─────────────────────────────────────────┤
│ 🖼️ Imagens (opcional)            ← NOVO! │
│ ┌─────────────────────────────┐         │
│ │  📤 Clique para selecionar  │         │
│ │     imagens                 │         │
│ └─────────────────────────────┘         │
├─────────────────────────────────────────┤
│ ☑ Slide ativo                            │
└─────────────────────────────────────────┘
```

---

### 8️⃣ Inspecionar o DOM (F12 no navegador)

**Console do navegador:**
```javascript
// Verificar se os campos existem no formulário
document.querySelector('input[type="datetime-local"]')  // Campo de data
document.querySelector('input[id="imageUpload"]')       // Input de imagem
document.querySelector('label[htmlFor="expiresAt"]')    // Label de expiração
```

**Se retornar elementos = Frontend atualizado! ✅**

---

### 9️⃣ Verificar o bundle size (curiosidade)
```powershell
# Ver tamanho dos arquivos gerados
docker exec jimi-app du -h /app/frontend/assets/*.js
docker exec jimi-app du -h /app/frontend/assets/*.css
```

---

### 🔟 Teste completo end-to-end

**No navegador (http://localhost:1212/admin):**

1. **Criar slide com expiração:**
   - Título: "Teste Expiração"
   - Conteúdo: "Este slide expira"
   - Data de Expiração: Escolha uma data futura
   - Clicar em "Salvar"

2. **Verificar se foi salvo com expiração:**
```powershell
(Invoke-WebRequest -Uri "http://localhost:1212/api/slides" -UseBasicParsing).Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
```

Procure pelo slide "Teste Expiração" e veja se tem `expiresAt` preenchido.

3. **Upload de imagem (se possível):**
   - Editar o slide criado
   - Clicar na área de upload
   - Selecionar uma imagem
   - Ver preview
   - Salvar

4. **Verificar se imagem foi salva:**
```powershell
# Ver arquivos na pasta uploads
docker exec jimi-app ls -la /app/uploads/

# Ver registros de attachments no banco
docker exec jimi-postgres psql -U painel_user -d painel_jimi -c "SELECT * FROM slide_attachments;"
```

---

## 🎯 Resumo dos Comandos (All-in-One)

Execute este bloco para fazer TODAS as verificações:

```powershell
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🧪 TESTANDO FRONTEND ATUALIZADO" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# 1. Containers
Write-Host "1️⃣ Status dos containers:" -ForegroundColor Blue
docker ps --filter "name=jimi" --format "table {{.Names}}\t{{.Status}}"
Write-Host ""

# 2. Frontend files
Write-Host "2️⃣ Arquivos do frontend:" -ForegroundColor Blue
docker exec jimi-app ls -la /app/frontend/ 2>$null
Write-Host ""

# 3. JavaScript compilado
Write-Host "3️⃣ Verificando features no código compilado:" -ForegroundColor Blue
$hasExpiresAt = docker exec jimi-app grep -o "expiresAt" /app/frontend/assets/*.js 2>$null
if ($hasExpiresAt) {
    Write-Host "  ✅ 'expiresAt' encontrado no código!" -ForegroundColor Green
} else {
    Write-Host "  ❌ 'expiresAt' NÃO encontrado" -ForegroundColor Red
}

$hasImageUpload = docker exec jimi-app grep -o "imageUpload" /app/frontend/assets/*.js 2>$null
if ($hasImageUpload) {
    Write-Host "  ✅ 'imageUpload' encontrado no código!" -ForegroundColor Green
} else {
    Write-Host "  ❌ 'imageUpload' NÃO encontrado" -ForegroundColor Red
}
Write-Host ""

# 4. API Test
Write-Host "4️⃣ Testando API:" -ForegroundColor Blue
try {
    $apiResponse = (Invoke-WebRequest -Uri "http://localhost:1212/api/slides" -UseBasicParsing).Content | ConvertFrom-Json
    if ($apiResponse.slides[0].expiresAt -ne $null -or $apiResponse.slides[0].PSObject.Properties.Name -contains "expiresAt") {
        Write-Host "  ✅ API retorna campo 'expiresAt'" -ForegroundColor Green
    } else {
        Write-Host "  ❌ API NÃO retorna campo 'expiresAt'" -ForegroundColor Red
    }
    if ($apiResponse.slides[0].isArchived -ne $null -or $apiResponse.slides[0].PSObject.Properties.Name -contains "isArchived") {
        Write-Host "  ✅ API retorna campo 'isArchived'" -ForegroundColor Green
    } else {
        Write-Host "  ❌ API NÃO retorna campo 'isArchived'" -ForegroundColor Red
    }
} catch {
    Write-Host "  ❌ Erro ao testar API: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 5. Logs
Write-Host "5️⃣ Últimas linhas do log:" -ForegroundColor Blue
docker logs jimi-app --tail=5
Write-Host ""

# 6. Conclusão
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 RESULTADO" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Se TODOS os testes acima passaram, acesse:" -ForegroundColor Green
Write-Host "   http://localhost:1212/admin" -ForegroundColor Yellow
Write-Host ""
Write-Host "   E clique em 'Novo Slide' para ver os novos campos!" -ForegroundColor White
Write-Host ""
```

---

## ✅ Teste Visual (Mais Confiável)

**A melhor forma de confirmar:**

1. Abra: http://localhost:1212/admin
2. Login: `admin` / `admin123`
3. Clique em "Slides" → "Novo Slide"
4. **Se você VÊ:**
   - ✅ Campo de data/hora com ícone de calendário
   - ✅ Área de upload com ícone de imagem
   - ✅ Texto "Data de Expiração (opcional)"
   - ✅ Texto "Imagens (opcional)"

**= FRONTEND ESTÁ ATUALIZADO! 🎉**

Se NÃO ver esses campos, execute o comando completo acima e me mostre a saída!
