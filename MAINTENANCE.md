# 🔧 Guia de Manutenção - Painel JIMI IOT Brasil

## 📋 Arquitetura de Containers

### Containers Independentes:
1. **jimi-postgres** - Banco de dados PostgreSQL
2. **jimi-app** - Aplicação Node.js (Backend + Frontend)
3. **jimi-nginx** - Proxy reverso e servidor web

### Volumes Persistentes:
- `jimi_postgres_data` - Dados do banco PostgreSQL
- `jimi_frontend_files` - Arquivos estáticos do frontend
- `jimi_app_logs` - Logs da aplicação
- `jimi_nginx_logs` - Logs do nginx

## 🚀 Scripts de Manutenção

### Uso do Script PowerShell:
```powershell
# Ver status de todos os containers
.\maintenance.ps1 status

# Ver logs recentes
.\maintenance.ps1 logs

# Reiniciar apenas a aplicação (sem afetar banco)
.\maintenance.ps1 restart-app

# Reiniciar apenas o nginx
.\maintenance.ps1 restart-nginx

# Backup do banco de dados
.\maintenance.ps1 backup-db

# Atualizar aplicação (rebuild + restart)
.\maintenance.ps1 update
```

## 🔄 Cenários de Manutenção

### 1. Atualização de Código (Mais Comum)
```powershell
# Método Rápido - Apenas reinicia app
.\maintenance.ps1 restart-app

# Método Completo - Rebuild da aplicação
.\maintenance.ps1 update
```
**✅ Vantagem:** Banco de dados não é afetado, usuários conectados não perdem sessão no nginx

### 2. Problemas de Performance/Memory
```powershell
# Reinicia apenas a aplicação
docker restart jimi-app

# Se persistir, rebuild completo
.\maintenance.ps1 update
```

### 3. Mudanças na Configuração do Nginx
```powershell
# Apenas nginx (se mudou nginx.conf)
.\maintenance.ps1 restart-nginx

# Ou manualmente:
docker restart jimi-nginx
```

### 4. Manutenção do Banco de Dados
```powershell
# Fazer backup antes de qualquer manutenção
.\maintenance.ps1 backup-db

# Conectar diretamente ao banco (porta 5433)
docker exec -it jimi-postgres psql -U painel_user -d painel_jimi

# Ou pela porta externa:
psql -h localhost -p 5433 -U painel_user -d painel_jimi
```

## 📊 Monitoramento

### Verificar Status:
```powershell
# Status completo dos containers
.\maintenance.ps1 status

# Logs em tempo real
docker logs -f jimi-app
docker logs -f jimi-nginx
docker logs -f jimi-postgres
```

### Verificar Recursos:
```powershell
# Uso de CPU e memória
docker stats jimi-app jimi-postgres jimi-nginx

# Espaço em disco dos volumes
docker system df -v
```

### Health Checks:
- **PostgreSQL:** Teste automático com `pg_isready`
- **Aplicação:** Porta 3001 acessível
- **Nginx:** Configuração válida

## 🆘 Troubleshooting

### Container da Aplicação não inicia:
```powershell
# Ver logs detalhados
docker logs jimi-app

# Verificar se banco está acessível
docker exec jimi-app ping postgres

# Testar conexão manual
docker exec -it jimi-app npm run test:db
```

### Nginx retorna 502 Bad Gateway:
```powershell
# Verificar se app está rodando
docker ps | grep jimi-app

# Testar conexão direta à aplicação
curl http://localhost:3001/api/health

# Verificar configuração do nginx
docker exec jimi-nginx nginx -t
```

### Banco de dados inacessível:
```powershell
# Verificar se PostgreSQL está rodando
docker exec jimi-postgres pg_isready -U painel_user

# Ver logs do banco
docker logs jimi-postgres

# Conectar diretamente
docker exec -it jimi-postgres psql -U painel_user -d painel_jimi
```

## 💾 Backup e Restore

### Backup Automático:
```powershell
# Backup manual
.\maintenance.ps1 backup-db

# Agendar backup diário (Task Scheduler)
schtasks /create /tn "JIMI_Backup" /tr "C:\path\to\maintenance.ps1 backup-db" /sc daily /st 02:00
```

### Restore de Backup:
```powershell
# Restore interativo
.\maintenance.ps1 restore-db

# Restore de arquivo específico
docker exec -i jimi-postgres psql -U painel_user -d painel_jimi < backup_file.sql
```

## 🔧 Configurações Avançadas

### Portas de Acesso:
- **Aplicação Principal:** http://localhost:1212
- **API Direta (debug):** http://localhost:3001
- **PostgreSQL (manutenção):** localhost:5433

### Variáveis de Ambiente:
```bash
# No container da aplicação
NODE_ENV=production
DATABASE_URL=postgresql://painel_user:JimiIOT2024@postgres:5432/painel_jimi
JWT_SECRET=jimi-iot-brasil-super-secure-secret-key-2024
PORT=3001
```

### Volumes e Dados:
```powershell
# Listar volumes
docker volume ls | grep jimi

# Backup de volume (dados completos)
docker run --rm -v jimi_postgres_data:/data -v ${PWD}:/backup alpine tar czf /backup/postgres_volume_backup.tar.gz /data

# Restore de volume
docker run --rm -v jimi_postgres_data:/data -v ${PWD}:/backup alpine tar xzf /backup/postgres_volume_backup.tar.gz
```

## 📈 Otimizações de Performance

### Limpeza Periódica:
```powershell
# Remove containers antigos
docker container prune -f

# Remove imagens não utilizadas
docker image prune -a -f

# Remove volumes órfãos
docker volume prune -f
```

### Monitoramento de Logs:
```powershell
# Limitar tamanho dos logs
# Adicionar ao docker-compose.yml:
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

## 🔐 Segurança

### Credenciais Padrão:
- **Admin:** admin / admin123
- **Viewer:** tv / viewer123
- **Database:** painel_user / JimiIOT2024

### Alteração de Senhas:
```sql
-- Conectar ao banco e alterar senhas
UPDATE users SET password = '$2b$10$novohash' WHERE username = 'admin';
```

---

## 🎯 Resumo - Comandos Essenciais

```powershell
# Status rápido
.\maintenance.ps1 status

# Reiniciar apenas app (preserva banco)
.\maintenance.ps1 restart-app

# Backup do banco
.\maintenance.ps1 backup-db

# Atualização completa
.\maintenance.ps1 update

# Em caso de emergência
.\maintenance.ps1 clean
```

**💡 Dica:** Sempre faça backup antes de atualizações importantes!