# ⚠️ CORREÇÃO: Features de Imagem e Expiração Não Aparecem no Docker

## 🔍 Diagnóstico

As features foram implementadas no código, mas provavelmente **a migração do banco não foi executada**.

## 🎯 Solução Rápida (3 opções)

### ✅ OPÇÃO 1: Executar Script de Verificação (RECOMENDADO)

**Windows:**
```powershell
.\verify-features.ps1
```

**Linux/Servidor:**
```bash
chmod +x verify-features.sh
./verify-features.sh
```

O script vai:
- ✅ Verificar se as colunas existem no banco
- ✅ Verificar se a migração foi aplicada
- ✅ Testar se a API retorna os novos campos
- ✅ **Mostrar exatamente o que fazer**

---

### ✅ OPÇÃO 2: Forçar Migração Manualmente

```bash
# Executar migração dentro do container
docker exec jimi-app npm run db:migrate

# Reiniciar o container
docker-compose restart app

# Verificar logs
docker-compose logs -f app
```

---

### ✅ OPÇÃO 3: Rebuild Completo (Mais Seguro)

**Windows:**
```powershell
.\rebuild.ps1
```

**Linux/Servidor:**
```bash
./rebuild.sh
```

---

## 🧪 Como Testar se Funcionou

### 1. Testar API diretamente:
```bash
curl http://localhost:1212/api/slides
```

**Deve retornar JSON com:**
```json
[
  {
    "id": "1",
    "title": "Slide de exemplo",
    "expiresAt": null,     ← ESTE CAMPO DEVE APARECER
    "isArchived": false,   ← ESTE CAMPO DEVE APARECER
    ...
  }
]
```

### 2. Verificar no banco:
```bash
docker exec jimi-postgres psql -U painel_user -d painel_jimi -c "\d slides"
```

**Deve mostrar:**
```
 expires_at   | timestamp without time zone |
 is_archived  | boolean                     | default false
```

### 3. Verificar tabela de anexos:
```bash
docker exec jimi-postgres psql -U painel_user -d painel_jimi -c "\d slide_attachments"
```

**Deve existir a tabela com estas colunas:**
```
 id          | integer  | primary key
 slide_id    | integer  | foreign key
 file_name   | text
 file_url    | text
 file_size   | integer
 mime_type   | text
```

---

## 🐛 Problemas Comuns

### Problema 1: "Coluna não existe"
```
❌ ERROR: column "expires_at" does not exist
```

**Solução:**
```bash
# Migração não foi executada
docker exec jimi-app npm run db:migrate
docker-compose restart app
```

### Problema 2: "Tabela já existe"
```
❌ ERROR: relation "slide_attachments" already exists
```

**Solução:**
```bash
# Migração foi aplicada parcialmente - verificar estado
docker exec jimi-postgres psql -U painel_user -d painel_jimi -c "
SELECT version FROM drizzle.__drizzle_migrations ORDER BY created_at;
"
```

### Problema 3: API não retorna novos campos
```
✅ Colunas existem no banco
❌ API não retorna expiresAt/isArchived
```

**Solução:**
```bash
# Código antigo ainda em cache
docker-compose restart app

# Ou rebuild
docker-compose up -d --build
```

---

## 📋 Checklist de Verificação

Execute e marque:

- [ ] Container está rodando: `docker ps | grep jimi-app`
- [ ] Migração foi executada: `docker exec jimi-postgres psql -U painel_user -d painel_jimi -c "SELECT * FROM drizzle.__drizzle_migrations;"`
- [ ] Coluna expires_at existe: `docker exec jimi-postgres psql -U painel_user -d painel_jimi -c "\d slides" | grep expires_at`
- [ ] Coluna is_archived existe: `docker exec jimi-postgres psql -U painel_user -d painel_jimi -c "\d slides" | grep is_archived`
- [ ] Tabela slide_attachments existe: `docker exec jimi-postgres psql -U painel_user -d painel_jimi -c "\d slide_attachments"`
- [ ] API retorna expiresAt: `curl http://localhost:1212/api/slides | grep expiresAt`
- [ ] API retorna isArchived: `curl http://localhost:1212/api/slides | grep isArchived`
- [ ] Job de expiração está ativo: `docker logs jimi-app | grep -i expiration`
- [ ] Pasta uploads existe: `docker exec jimi-app ls /app/uploads`

---

## 🚀 Comando All-in-One (Emergency Fix)

Se nada funcionar, execute este comando que faz TUDO:

```bash
# Para tudo, limpa, migra e reinicia
docker-compose down && \
docker exec jimi-postgres psql -U painel_user -d painel_jimi -c "DROP TABLE IF EXISTS slide_attachments CASCADE; ALTER TABLE slides DROP COLUMN IF EXISTS expires_at; ALTER TABLE slides DROP COLUMN IF EXISTS is_archived;" && \
docker-compose up -d && \
sleep 10 && \
docker exec jimi-app npm run db:migrate && \
docker-compose restart app && \
docker-compose logs -f app
```

⚠️ **CUIDADO:** Este comando remove e recria as colunas/tabelas!

---

## 💡 Dica Final

A forma mais rápida e segura de resolver:

1. **Execute o script de verificação:**
   ```bash
   ./verify-features.ps1   # Windows
   ./verify-features.sh    # Linux
   ```

2. **Siga exatamente o que o script recomendar**

3. **Se continuar com problema, me mostre a saída do script!**

---

## 📞 Debug Adicional

Se precisar de mais informações:

```bash
# Ver todas as migrações aplicadas
docker exec jimi-postgres psql -U painel_user -d painel_jimi -c "
SELECT * FROM drizzle.__drizzle_migrations ORDER BY created_at;
"

# Ver estrutura completa da tabela slides
docker exec jimi-postgres psql -U painel_user -d painel_jimi -c "\d+ slides"

# Ver logs de erro
docker-compose logs app --tail=100 | grep -i error

# Testar rotas de anexos
curl http://localhost:1212/api/slides/attachments/1
```
