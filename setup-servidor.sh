#!/bin/bash
# Script para configurar servidor via Termius

echo "🚀 JIMI IOT BRASIL - Setup Servidor Docker"
echo "=========================================="

# Atualizar sistema
echo "📦 Atualizando sistema..."
sudo apt update && sudo apt upgrade -y

# Instalar Docker
echo "🐳 Instalando Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
echo "🔧 Instalando Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Configurar firewall para porta 1212
echo "🔥 Configurando firewall..."
sudo ufw allow 1212
sudo ufw allow ssh
sudo ufw --force enable

# Verificar instalação
echo "✅ Verificando instalação..."
docker --version
docker-compose --version

echo "🎉 Servidor configurado! Agora execute:"
echo "   chmod +x deploy-docker.sh"
echo "   ./deploy-docker.sh"
echo ""
echo "🌐 Acesse depois em: http://SEU_IP:1212/admin"
