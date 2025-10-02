# 🚀 Deploy em Produção - Painel JIMI IOT Brasil

## 📋 Requisitos do Servidor

### Especificações Mínimas:
- **OS:** Ubuntu 20.04+ / CentOS 8+ / Amazon Linux 2
- **RAM:** 2GB mínimo, 4GB recomendado
- **CPU:** 2 vCPUs mínimo
- **Disk:** 20GB mínimo, SSD recomendado
- **Network:** Porta 1212 liberada no firewall

### Software Necessário:
```bash
# Docker & Docker Compose
sudo apt update
sudo apt install docker.io docker-compose -y
sudo systemctl enable docker
sudo systemctl start docker

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
```

## 🔧 Configuração do Servidor Oracle Cloud

### 1. Configuração de Firewall
```bash
# Ubuntu/Debian
sudo ufw allow 1212/tcp
sudo ufw allow 22/tcp
sudo ufw enable

# Oracle Cloud - Security Lists
# Adicionar regra: Ingress - TCP - Port 1212 - Source: 0.0.0.0/0
```

### 2. Configuração de DNS (Opcional)
```bash
# Se você tem um domínio, configure:
# A record: painel.jimi-iot.com.br -> 137.131.170.156
```

### 3. SSL/TLS com Let's Encrypt (Opcional)
```bash
# Instalar Certbot
sudo apt install certbot -y

# Gerar certificado (se tiver domínio)
sudo certbot certonly --standalone -d painel.jimi-iot.com.br

# Configurar renovação automática
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📦 Deploy da Aplicação

### 1. Clonar/Upload do Projeto
```bash
# Via Git (recomendado)
git clone <seu-repositorio> /opt/jimi-painel
cd /opt/jimi-painel

# Ou via upload direto
# scp -r ./painel_jimi user@137.131.170.156:/opt/jimi-painel
```

### 2. Configuração de Ambiente
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar configurações de produção
nano .env
```

#### Variáveis de Ambiente Obrigatórias:
```bash
# .env
NODE_ENV=production
JWT_SECRET=seu-jwt-secret-muito-seguro-aqui-2024
DATABASE_URL=postgresql://painel_user:JimiIOT2024@postgres:5432/painel_jimi

# Configurações de banco (se necessário alterar)
POSTGRES_DB=painel_jimi
POSTGRES_USER=painel_user
POSTGRES_PASSWORD=SuaSenhaSeguraAqui2024

# URL da aplicação (se usando domínio)
FRONTEND_URL=http://137.131.170.156:1212
VITE_API_URL=/api
```

### 3. Build e Deploy
```bash
# Dar permissão ao script de manutenção
chmod +x maintenance.ps1

# Build e start dos containers
docker-compose up -d --build

# Verificar status
docker-compose ps
```

### 4. Verificação do Deploy
```bash
# Testar endpoints
curl http://137.131.170.156:1212/api/health
curl http://137.131.170.156:1212

# Ver logs
docker logs jimi-app
docker logs jimi-nginx
docker logs jimi-postgres
```

## 🔐 Configuração de Segurança

### 1. Alterar Senhas Padrão
```bash
# Conectar ao banco
docker exec -it jimi-postgres psql -U painel_user -d painel_jimi

# Alterar senhas (use hash bcrypt)
-- Gerar hash para nova senha:
-- npm install -g bcrypt-cli
-- bcrypt-cli "nova_senha_admin" 10

UPDATE users SET password = '$2b$10$NovoHashAqui' WHERE username = 'admin';
UPDATE users SET password = '$2b$10$NovoHashAqui' WHERE username = 'tv';
```

### 2. Configurar Firewall Avançado
```bash
# Restringir acesso SSH
sudo ufw allow from SeuIPFixo to any port 22

# Log de tentativas
sudo ufw logging on
```

### 3. Configurar Backup Automático
```bash
# Criar script de backup
sudo nano /opt/backup-jimi.sh
```

```bash
#!/bin/bash
# Script de backup automático
cd /opt/jimi-painel
./maintenance.ps1 backup-db

# Enviar para bucket S3/storage
# aws s3 cp backup_jimi_*.sql.zip s3://seu-bucket/backups/
```

```bash
# Tornar executável e agendar
sudo chmod +x /opt/backup-jimi.sh
sudo crontab -e
# Adicionar: 0 2 * * * /opt/backup-jimi.sh
```

## 📊 Monitoramento

### 1. Logs Centralizados
```bash
# Configurar rotação de logs
sudo nano /etc/logrotate.d/docker

/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=1M
    missingok
    delaycompress
    copytruncate
}
```

### 2. Monitoramento de Recursos
```bash
# Instalar htop para monitoramento
sudo apt install htop -y

# Script de monitoramento
nano /opt/monitor-jimi.sh
```

```bash
#!/bin/bash
# Monitor de recursos
echo "=== $(date) ===" >> /opt/jimi-monitor.log
docker stats --no-stream jimi-app jimi-postgres jimi-nginx >> /opt/jimi-monitor.log
df -h >> /opt/jimi-monitor.log
free -h >> /opt/jimi-monitor.log
echo "==================" >> /opt/jimi-monitor.log
```

### 3. Alertas por Email (Opcional)
```bash
# Instalar mailutils
sudo apt install mailutils -y

# Script de alerta
nano /opt/alert-jimi.sh
```

```bash
#!/bin/bash
# Verificar se aplicação está rodando
if ! curl -s http://localhost:1212/api/health > /dev/null; then
    echo "ALERTA: Painel JIMI não está respondendo!" | mail -s "JIMI Down" admin@empresa.com
    # Tentar restart automático
    cd /opt/jimi-painel && docker-compose restart
fi
```

## 🚀 Otimizações de Performance

### 1. Configuração de Swap
```bash
# Criar swap file (recomendado para VPS pequenas)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Tornar permanente
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 2. Otimização do Docker
```bash
# Limitar logs do Docker
sudo nano /etc/docker/daemon.json
```

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

```bash
# Restart Docker
sudo systemctl restart docker
```

### 3. Configuração de Nginx (se necessário)
```bash
# Editar nginx.conf para otimizações
worker_processes auto;
worker_connections 1024;

# Gzip compression
gzip on;
gzip_types text/css application/javascript image/png image/jpg;

# Cache estático
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🆘 Troubleshooting de Produção

### Problemas Comuns:

#### 1. Container não inicia
```bash
# Ver logs detalhados
docker logs jimi-app --details

# Verificar recursos
free -h
df -h

# Verificar rede
docker network ls
```

#### 2. Banco não conecta
```bash
# Testar conexão
docker exec jimi-postgres pg_isready -U painel_user

# Verificar logs do PostgreSQL
docker logs jimi-postgres
```

#### 3. Nginx 502 Error
```bash
# Verificar se app está rodando
curl http://localhost:3001/api/health

# Testar configuração nginx
docker exec jimi-nginx nginx -t
```

#### 4. Performance baixa
```bash
# Monitorar recursos
htop
docker stats

# Verificar logs de erro
docker logs jimi-app | grep -i error
```

## 📱 Acessos

### URLs de Acesso:
- **Painel Principal:** http://137.131.170.156:1212
- **Admin:** http://137.131.170.156:1212/admin
- **Login:** http://137.131.170.156:1212/login

### Credenciais Padrão:
- **Admin:** admin / admin123
- **TV/Viewer:** tv / viewer123

**⚠️ IMPORTANTE:** Altere as senhas padrão imediatamente após o deploy!

## 🔄 Procedimentos de Manutenção

### Update da Aplicação:
```bash
cd /opt/jimi-painel

# Backup antes de atualizar
./maintenance.ps1 backup-db

# Pull do código novo
git pull origin main

# Rebuild e restart
./maintenance.ps1 update
```

### Restart de Emergência:
```bash
# Restart completo
docker-compose restart

# Ou containers individuais
docker restart jimi-app
docker restart jimi-nginx
```

---

## ✅ Checklist de Deploy

- [ ] Servidor configurado com Docker
- [ ] Firewall liberado (porta 1212)
- [ ] Projeto clonado/uploaded
- [ ] Arquivo .env configurado
- [ ] Containers buildados e rodando
- [ ] Health check respondendo
- [ ] Interface acessível
- [ ] Senhas padrão alteradas
- [ ] Backup automático configurado
- [ ] Monitoramento configurado
- [ ] DNS configurado (se aplicável)
- [ ] SSL configurado (se aplicável)

**🎉 Deploy Completo!** Seu Painel JIMI IOT Brasil está pronto para uso em produção.