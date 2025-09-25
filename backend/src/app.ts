import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Import routes
import authRoutes from './routes/auth';
import slidesRoutes from './routes/slides';
import fixedContentRoutes from './routes/fixedContent';
import usersRoutes from './routes/users';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

// Função para criar usuários padrão
async function createDefaultUsers() {
  try {
    console.log('🔍 Verificando usuários padrão...');
    
    // Verificar se já existem usuários
    const userCount = await prisma.user.count();
    
    if (userCount === 0) {
      console.log('👤 Criando usuários padrão...');
      
      // Criar usuário admin
      const adminPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: {
          username: 'admin',
          password: adminPassword,
          role: 'ADMIN'
        }
      });
      
      // Criar usuário viewer
      const viewerPassword = await bcrypt.hash('viewer123', 10);
      await prisma.user.create({
        data: {
          username: 'tv',
          password: viewerPassword,
          role: 'VIEWER'
        }
      });
      
      console.log('✅ Usuários padrão criados com sucesso!');
      console.log('   - admin/admin123 (ADMIN)');
      console.log('   - tv/viewer123 (VIEWER)');
    } else {
      console.log(`✅ ${userCount} usuário(s) já existem no banco de dados`);
    }
  } catch (error) {
    console.error('❌ Erro ao criar usuários padrão:', error);
  }
}

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/slides', slidesRoutes);
app.use('/api/fixed-content', fixedContentRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/users', usersRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'JIMI IOT Brasil Dashboard API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Função de inicialização
async function startServer() {
  try {
    // Criar usuários padrão se necessário
    await createDefaultUsers();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 JIMI IOT Brasil Dashboard API running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Dashboard API ready at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Inicializar servidor
startServer();
