# JIMI IOT Brasil - Dashboard Profissional

Um sistema completo de dashboard para exibição em televisores, desenvolvido especificamente para a JIMI IOT BRASIL.

## 🚀 Características Principais

- **Tela de Exibição Dividida**: 25% seção fixa + 75% slideshow dinâmico
- **Painel Administrativo**: Gerenciamento completo de conteúdo
- **Sistema de Autenticação**: Dois níveis de acesso (Administrador/Visualizador)
- **Design Responsivo**: Otimizado para TVs e diferentes resoluções
- **Atualizações em Tempo Real**: Conteúdo atualizado automaticamente
- **Interface Moderna**: Seguindo a identidade visual da JIMI IOT BRASIL

## 🛠 Tecnologias Utilizadas

### Frontend
- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **Styled Components** para estilização
- **React Router** para navegação
- **React Query** para gerenciamento de estado
- **Axios** para requisições HTTP

### Backend
- **Node.js** com Express
- **TypeScript** para tipagem
- **Prisma ORM** com PostgreSQL
- **JWT** para autenticação
- **bcryptjs** para criptografia de senhas
- **Helmet** e Rate Limiting para segurança

## 📋 Pré-requisitos

- Node.js >= 18.0.0
- PostgreSQL >= 13
- npm ou yarn

## 🔧 Instalação e Configuração

### 1. Clone o repositório
```bash
git clone <repository-url>
cd painel_jimi
```

### 2. Instale as dependências do frontend
```bash
npm install
```

### 3. Instale as dependências do backend
```bash
cd backend
npm install
```

### 4. Configure o banco de dados
```bash
# Copie o arquivo de exemplo
cp backend/.env.example backend/.env

# Edite o arquivo backend/.env com suas configurações de banco de dados
# DATABASE_URL="postgresql://username:password@localhost:5432/painel_jimi"
```

### 5. Execute as migrações do banco
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### 6. Popule o banco com dados iniciais
```bash
cd backend
npm run seed
```

## 🚀 Executando o Projeto

### 🐳 Docker (Recomendado para Produção)

**Pré-requisitos:**
- Docker >= 20.10
- Docker Compose >= 2.0

```bash
# 1. Clone o repositório
git clone <repository-url>
cd painel_jimi

# 2. Execute com Docker Compose (Versão Final - Robusta)
docker compose up -d

# 3. Monitore a inicialização (primeira vez pode levar alguns minutos)
docker compose logs -f app

# 4. Acesse o sistema quando ver "🎉 Iniciando servidor Node.js..."
# http://localhost:1212
```

**✨ Funcionalidades da Versão Final:**
- ✅ Resolução automática de problemas do Prisma
- ✅ Verificação de conectividade com banco
- ✅ Timeout robusto para PostgreSQL
- ✅ Criação automática de usuários (admin/admin123, tv/viewer123)
- ✅ Health checks completos
- ✅ Logs detalhados para debugging

**Usuários criados automaticamente:**
- **Admin**: usuário `admin`, senha `admin123`
- **Visualizador**: usuário `tv`, senha `viewer123`

**Comandos úteis:**
```bash
# Ver logs em tempo real
docker compose logs -f

# Ver logs apenas do app
docker compose logs -f app

# Parar os serviços
docker compose down

# Reconstruir as imagens (se houver mudanças no código)
docker compose up --build -d

# Limpar volumes (CUIDADO: apaga dados do banco)
docker compose down -v

# Verificar status dos containers
docker compose ps

# Verificar health dos containers
docker compose ps --format "table {{.Service}}\t{{.Status}}\t{{.Health}}"
```

### 🛠 Desenvolvimento Local

**Pré-requisitos:**
- Node.js >= 18.0.0
- PostgreSQL >= 13

```bash
# Terminal 1 - Backend
cd backend
npm install
cp .env.example .env
# Configure o DATABASE_URL no arquivo .env
npx prisma migrate dev
npx prisma generate
npm run dev

# Terminal 2 - Frontend (na raiz do projeto)
npm install
npm run dev
```

## 👥 Usuários Padrão

Após executar o seed, os seguintes usuários estarão disponíveis:

- **Administrador**: 
  - Usuário: `admin`
  - Senha: `admin123`
  - Acesso: Painel administrativo completo

- **Visualizador (TV)**:
  - Usuário: `tv`
  - Senha: `viewer123`
  - Acesso: Apenas visualização do dashboard

## 🎨 Identidade Visual

### Cores
- **Azul Principal**: #09A0E9
- **Cinza Escuro**: #272D3B
- **Branco**: #FFFFFF

### Tipografia
- **Fonte Principal**: Roboto
- **Fonte Secundária**: Montserrat

---

**JIMI IOT BRASIL** - Transformando o futuro com tecnologia inteligente
