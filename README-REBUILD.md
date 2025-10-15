# 🎯 INSTRUÇÕES RÁPIDAS - Aplicar Correções

## ⚠️ O Problema
As correções foram feitas no código-fonte mas **não estão no container Docker** porque:
- Docker usa imagem em cache
- Precisa fazer **rebuild** para aplicar mudanças

## ✅ Correções Implementadas
1. ✅ Trust proxy configurado (para rate limiting funcionar com nginx)
2. ✅ Seed idempotente (não duplica mais dados)
3. ✅ Rate limits ajustados (1800 req/60s)
4. ✅ Suporte para expiração de slides
5. ✅ Suporte para anexos de imagens

---

## 🚀 OPÇÃO 1: Script Automático (RECOMENDADO)

### No Servidor (Linux/Oracle Cloud):
```bash
# 1. Fazer upload do projeto atualizado
cd ~/painel_jimi

# 2. Dar permissão e executar script
chmod +x rebuild.sh
./rebuild.sh
```

### No Windows (Local):
```powershell
# Executar no PowerShell
.\rebuild.ps1
```

---

## 🔧 OPÇÃO 2: Comandos Manuais

### **Servidor de Produção (137.131.170.156):**

```bash
# Comando único (copie e cole tudo):
cd ~/painel_jimi && \
docker-compose down && \
docker rmi -f $(docker images -q 'painel_jimi*') 2>/dev/null && \
docker-compose build --no-cache app && \
docker-compose up -d && \
echo "✅ Rebuild concluído!" && \
docker-compose logs -f app
```

### **Windows Local (para testar):**

```powershell
# Executar no PowerShell:
cd "C:\Users\LuisGustavo\OneDrive - Newtec Telemetria\Documentos\painel_jimi"
docker-compose down
docker rmi -f $(docker images -q 'painel_jimi*')
docker-compose build --no-cache app
docker-compose up -d
docker-compose logs -f app
```

---

## 📋 Checklist de Verificação

Após o rebuild, verificar:

### ✅ Logs devem mostrar:
```
✅ PostgreSQL conectado!
✅ Executando migrações com Drizzle...
✅ ℹ️ Seed já executado anteriormente — pulando criação de dados padrão
✅ 🚀 Servidor rodando na porta 3001
```

### ❌ NÃO deve aparecer:
```
❌ ValidationError: The 'X-Forwarded-For' header is set but trust proxy is false
❌ Too Many Requests
❌ Duplicando usuários/slides
```

### 🧪 Testar:
- [ ] http://137.131.170.156:1212 - Frontend carrega
- [ ] http://137.131.170.156:1212/api/health - Retorna {"status":"ok"}
- [ ] http://137.131.170.156:1212/login - Login funciona
- [ ] http://137.131.170.156:1212/admin - Admin panel abre
- [ ] Fazer 100 requests rápidas - Não deve dar erro 429

---

## 🆘 Se der erro

### Ver logs detalhados:
```bash
docker-compose logs app --tail=100
```

### Container não sobe:
```bash
# Ver o que está errado
docker-compose ps
docker-compose logs app

# Tentar restart
docker-compose restart app
```

### Build falha:
```bash
# Limpar TUDO e começar do zero
docker-compose down -v
docker system prune -a --volumes
docker-compose up -d --build
```

---

## 📊 Arquivos Criados

- ✅ `REBUILD-GUIDE.md` - Guia completo com explicações
- ✅ `rebuild.sh` - Script automático para Linux
- ✅ `rebuild.ps1` - Script automático para Windows
- ✅ `backend/cleanup-duplicates.sql` - SQL para limpar duplicatas
- ✅ `DEPLOY-GUIDE.md` - Guia de deploy anterior

---

## 🎯 Próximos Passos

Depois que o rebuild funcionar:

1. **Limpar dados duplicados** (se necessário):
   ```bash
   cat backend/cleanup-duplicates.sql | docker exec -i jimi-postgres psql -U painel_user -d painel_jimi
   ```

2. **Implementar UI Frontend** para:
   - Data de expiração dos slides
   - Upload de imagens nos cards
   - Seção de slides arquivados

3. **Monitorar produção** por 24h

---

## 📞 Comandos de Debug

```bash
# Status dos containers
docker-compose ps

# Ver variáveis de ambiente
docker exec jimi-app env | grep -E "SEED|RATE|JWT"

# Testar trust proxy
docker exec jimi-app cat dist/app.js | grep "trust.proxy"

# Conectar no banco
docker exec -it jimi-postgres psql -U painel_user -d painel_jimi

# Restart individual
docker-compose restart app
```

---

## 💡 Dica Final

**Escolha uma opção e execute:**

- 🐧 **Linux/Servidor:** `./rebuild.sh`
- 🪟 **Windows/Local:** `.\rebuild.ps1`
- 📝 **Manual:** Copie o comando único acima

**Qualquer dúvida, me chame! 🚀**
