# 🚀 Guia de Deploy - Correções e Limpeza

## ⚠️ Situação Atual

1. **Seed duplicando dados** ✅ RESOLVIDO
   - Implementado verificação `SEED_SKIP_IF_EXISTS=true`
   - Seed agora é idempotente (não duplica mais)

2. **Rate Limiter com erro** ✅ RESOLVIDO
   - Adicionado `app.set('trust proxy', true);` no Express
   - Agora reconhece corretamente IPs através do nginx

3. **Dados duplicados no banco** ⚠️ PRECISA LIMPAR

## 📋 Passos para Deploy

### 1️⃣ Limpar Dados Duplicados (RECOMENDADO)

Execute este comando no seu servidor para limpar duplicatas:

```bash
# Conectar ao container do postgres
docker exec -i $(docker ps -q -f name=postgres) psql -U jimi -d jimi_painel < backend/cleanup-duplicates.sql
```

**OU** se preferir fazer manualmente:

```bash
# Entrar no container
docker exec -it $(docker ps -q -f name=postgres) psql -U jimi -d jimi_painel

# Depois execute os comandos SQL do arquivo cleanup-duplicates.sql
```

### 2️⃣ Reconstruir e Redeployar

No seu servidor (137.131.170.156):

```bash
# Navegar até o diretório do projeto
cd ~/painel_jimi

# Baixar as atualizações
git pull

# Parar os containers
docker-compose down

# Reconstruir e iniciar
docker-compose up --build -d

# Verificar os logs
docker-compose logs -f app
```

### 3️⃣ Verificar se Funcionou

```bash
# Ver logs do backend
docker-compose logs app | tail -50

# Você deve ver:
# ✅ "ℹ️ Seed já executado anteriormente — pulando criação de dados padrão"
# ✅ "🚀 Servidor rodando na porta 3001"
# ❌ NÃO deve ter "ValidationError" sobre X-Forwarded-For
```

### 4️⃣ Testar a Aplicação

Acesse: http://137.131.170.156:1212

1. **Testar Display Page** (/)
   - Deve carregar os slides sem erro 429
   - Conteúdo fixo deve aparecer na sidebar

2. **Testar Login** (/login)
   - Usuario: `admin` / Senha: `admin123`
   - Não deve dar erro de rate limit

3. **Testar Admin Panel** (/admin)
   - Verificar se não há slides/conteúdo duplicado
   - Criar um novo slide de teste

## 🔧 Opção Alternativa: Fresh Start

Se preferir começar do zero (⚠️ APAGA TODOS OS DADOS):

```bash
cd ~/painel_jimi
git pull
docker-compose down
docker volume rm jimi_postgres_data
docker-compose up --build -d
```

## 📊 Melhorias Implementadas

### ✅ Backend
- [x] Trust proxy configurado
- [x] Rate limits aumentados (2000 req/60s)
- [x] Seed idempotente
- [x] Schema para expiração de slides
- [x] Schema para anexos de imagens
- [x] Job automático para arquivar slides expirados
- [x] Endpoints para upload de imagens

### ⏳ Frontend (Próximos Passos)
- [ ] UI para definir data de expiração nos slides
- [ ] UI para upload de imagens nos cards
- [ ] Seção "Arquivados" no painel admin
- [ ] Indicadores visuais de expiração (relógio, countdown)
- [ ] Galeria de imagens com lightbox

## 🐛 Troubleshooting

### Erro 429 continua aparecendo?
```bash
# Verificar configuração do trust proxy
docker-compose exec app cat dist/app.js | grep "trust proxy"
```

### Seed ainda duplicando?
```bash
# Verificar variável de ambiente
docker-compose exec app env | grep SEED
# Deve mostrar: SEED_SKIP_IF_EXISTS=true
```

### Logs com erro?
```bash
# Ver logs completos
docker-compose logs app --tail=100
docker-compose logs postgres --tail=50
docker-compose logs nginx --tail=50
```

## 📝 Comandos Úteis

```bash
# Status dos containers
docker-compose ps

# Reiniciar apenas o backend
docker-compose restart app

# Ver uso de recursos
docker stats

# Backup do banco
docker exec $(docker ps -q -f name=postgres) pg_dump -U jimi jimi_painel > backup.sql
```

## 🎯 Próxima Etapa

Depois que o deploy estiver funcionando perfeitamente, podemos implementar a interface frontend para:
1. Configurar data de expiração dos slides
2. Upload de imagens nos cards
3. Visualizar slides arquivados

**Precisa de ajuda com algum passo específico?** 🚀
