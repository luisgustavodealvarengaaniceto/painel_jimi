# 🔄 Guia de Rebuild - Aplicar Correções no Docker

## ⚠️ Problema
As correções feitas no código não foram aplicadas no container Docker porque:
1. O Docker usa uma **imagem já buildada** (cache)
2. É necessário fazer **rebuild** para aplicar as mudanças

## ✅ Correções Implementadas no Código

1. **Trust Proxy** (`backend/src/app.ts` linha 45)
   ```typescript
   app.set('trust proxy', 1);
   ```

2. **Seed Idempotente** (`backend/src/db/seed.ts`)
   - Verifica se dados já existem antes de inserir
   - Não duplica mais usuários/slides/conteúdo

3. **Rate Limits Ajustados** (`backend/src/app.ts`)
   - General: 1800 req/60s
   - Login: 10 req/15min
   - Respeita X-Forwarded-For do nginx

## 🚀 Comandos para Aplicar as Correções

### **No seu servidor (137.131.170.156):**

```bash
# 1️⃣ Navegar até o diretório
cd ~/painel_jimi

# 2️⃣ Puxar as últimas alterações (se estiver no Git)
git pull

# 3️⃣ Parar os containers
docker-compose down

# 4️⃣ IMPORTANTE: Remover imagem antiga para forçar rebuild
docker rmi jimi-app painel_jimi-app painel_jimi_app 2>/dev/null || true

# 5️⃣ Rebuild COMPLETO (força reconstruir sem cache)
docker-compose build --no-cache app

# 6️⃣ Subir os containers novamente
docker-compose up -d

# 7️⃣ Verificar logs para confirmar correções aplicadas
docker-compose logs -f app
```

### **Você deve ver nos logs:**

✅ **Correções Aplicadas:**
```
🚀 JIMI IOT BRASIL - Sistema Moderno com Drizzle ORM
⏳ Aguardando PostgreSQL...
✅ PostgreSQL conectado!
📊 Executando migrações com Drizzle...
🌱 Executando seed...
ℹ️ Seed já executado anteriormente — pulando criação de dados padrão
🎉 Iniciando servidor Node.js...
🚀 Servidor rodando na porta 3001
```

❌ **NÃO deve aparecer:**
```
ValidationError: The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false
```

## 🧪 Testar as Correções

### 1. Verificar Trust Proxy
```bash
# Ver se o código foi aplicado
docker exec jimi-app cat dist/app.js | grep -A2 "trust.proxy" | head -5
```

### 2. Testar Rate Limiting
```bash
# Fazer várias requisições rápidas (não deve dar 429 imediatamente)
for i in {1..50}; do
  curl -s -o /dev/null -w "%{http_code}\n" http://137.131.170.156:1212/api/health
done
```

### 3. Verificar Seed Idempotente
```bash
# Seed não deve duplicar dados
docker-compose logs app | grep -i "seed"

# Deve mostrar: "ℹ️ Seed já executado anteriormente"
```

### 4. Testar Login
```bash
# Login deve funcionar sem erro 429
curl -X POST http://137.131.170.156:1212/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 🔧 Comandos Úteis

### Ver build em tempo real:
```bash
docker-compose build --no-cache --progress=plain app
```

### Limpar TUDO e começar do zero:
```bash
# ⚠️ CUIDADO: Remove TODOS os dados!
docker-compose down -v
docker rmi $(docker images -q painel_jimi*)
docker volume rm jimi_postgres_data jimi_frontend_files jimi_app_logs
docker-compose up -d --build
```

### Verificar variáveis de ambiente no container:
```bash
docker exec jimi-app env | grep -E "SEED|RATE|JWT|DATABASE"
```

### Ver processo do Node.js rodando:
```bash
docker exec jimi-app ps aux | grep node
```

## 📊 Checklist de Verificação

Após o rebuild, verifique:

- [ ] Container `jimi-app` está rodando: `docker-compose ps`
- [ ] Logs não mostram erro de trust proxy: `docker-compose logs app | grep -i error`
- [ ] Seed não duplica dados: `docker-compose logs app | grep seed`
- [ ] Rate limiting funciona: teste 100 requisições rápidas
- [ ] Login funciona: teste pelo navegador
- [ ] Display page carrega: acesse http://137.131.170.156:1212
- [ ] Admin panel funciona: acesse http://137.131.170.156:1212/admin

## 🆘 Se algo der errado

### Container não sobe:
```bash
# Ver erro detalhado
docker-compose logs app --tail=100

# Ver se portas estão em uso
sudo netstat -tulpn | grep -E '3001|1212'
```

### Build falha:
```bash
# Limpar cache do Docker completamente
docker system prune -a --volumes

# Rebuild do zero
docker-compose up -d --build --force-recreate
```

### Ainda dá erro 429:
```bash
# Verificar se trust proxy está ativo
docker exec jimi-app node -e "const express = require('express'); const app = express(); app.set('trust proxy', 1); console.log('Trust proxy:', app.get('trust proxy'));"

# Verificar configuração do nginx
docker exec jimi-nginx cat /etc/nginx/nginx.conf | grep -A5 proxy_set_header
```

## 📝 Variáveis de Ambiente

Confirme que `.env.docker` tem estas configurações:

```bash
# Rate Limiting (mais permissivo)
RATE_LIMIT_WINDOW_MS=60000          # 1 minuto
RATE_LIMIT_MAX=1800                  # 1800 requisições/minuto
LOGIN_RATE_LIMIT_WINDOW_MS=900000    # 15 minutos
LOGIN_RATE_LIMIT_MAX=10              # 10 tentativas/15min

# Seed controlado
SEED_ON_STARTUP=false                # Não executa seed automático
```

## 🎯 Próximo Passo

Depois que confirmar que as correções estão aplicadas:

1. **Limpar dados duplicados** (se necessário):
   ```bash
   cat backend/cleanup-duplicates.sql | docker exec -i jimi-postgres psql -U painel_user -d painel_jimi
   ```

2. **Monitorar por 24h** para garantir estabilidade

3. **Implementar UI** para anexos e expiração de slides

---

**🔥 Comando Rápido (All-in-One):**

```bash
cd ~/painel_jimi && \
docker-compose down && \
docker rmi -f $(docker images -q painel_jimi*) 2>/dev/null && \
docker-compose build --no-cache app && \
docker-compose up -d && \
docker-compose logs -f app
```

**Copie e cole esse comando único no seu servidor! 🚀**
