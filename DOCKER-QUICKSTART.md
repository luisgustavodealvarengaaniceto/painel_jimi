# 🚀 Instruções Rápidas - Docker

## Para usuários que acabaram de fazer git clone

Se você acabou de fazer `git clone` e quer rodar o sistema imediatamente:

```bash
# 1. Entre no diretório do projeto
cd painel_jimi

# 2. Execute o Docker Compose
docker compose up -d

# 3. Aguarde os containers iniciarem (pode levar alguns minutos na primeira vez)
docker compose logs -f

# 4. Acesse o sistema em: http://localhost:1212
```

## ✅ Credenciais Padrão

- **Administrador**: `admin` / `admin123`
- **Visualizador TV**: `tv` / `viewer123`

## 🔧 Comandos Úteis

```bash
# Ver status dos containers
docker compose ps

# Ver logs em tempo real
docker compose logs -f

# Reiniciar um serviço específico
docker compose restart app

# Parar tudo
docker compose down

# Reconstruir se houver mudanças no código
docker compose up --build -d
```

## 📱 URLs de Acesso

- **Dashboard Principal**: http://localhost:1212
- **Página de Login**: http://localhost:1212/login
- **Painel Admin**: http://localhost:1212/admin (apenas com usuário admin)

## 🚨 Troubleshooting

### Container "jimi-app" reiniciando constantemente?

1. Verifique os logs:
```bash
docker logs jimi-app --tail 50
```

2. Problemas comuns:
   - **Porta em uso**: Verifique se a porta 1212 está livre
   - **Falta de memória**: O sistema precisa de pelo menos 1GB RAM
   - **Dependências**: Aguarde o PostgreSQL inicializar completamente

### ❌ Erro de permissões do Prisma?

Se você vir erros como:
- "Can't write to /app/backend/node_modules/@prisma/engines"
- "Prisma failed to detect the libssl/openssl version"

**Solução 1 - Use a versão simplificada:**
```bash
# Pare os containers atuais
docker compose down -v

# Use o docker-compose simplificado
docker compose -f docker-compose.simple.yml up -d

# Monitore os logs
docker compose -f docker-compose.simple.yml logs -f
```

**Solução 2 - Reconstrua com cache limpo:**
```bash
docker compose down -v
docker system prune -f
docker compose up --build --no-cache -d
```

### Banco de dados não conecta?

```bash
# Verifique o status do PostgreSQL
docker compose exec postgres pg_isready -U painel_user -d painel_jimi

# Se necessário, recrie os volumes
docker compose down -v
docker compose up -d
```

### Frontend não carrega?

```bash
# Verifique se o nginx está executando
docker compose exec nginx nginx -t

# Reconstrua o frontend
docker compose up --build -d app
```

## 📞 Suporte

Se você continuar tendo problemas, verifique:

1. Docker e Docker Compose estão instalados e funcionando
2. Portas 1212, 3001 e 5432 estão livres
3. Você tem pelo menos 1GB de RAM disponível
4. Firewall não está bloqueando as portas

**Logs completos para debugging:**
```bash
docker compose logs --tail 100 > debug.log
```