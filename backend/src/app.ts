import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { testConnection } from './db';
import seed from './db/seed';

// Import routes
import authRoutes from './routes/auth';
import slidesRoutes from './routes/slides';
import fixedContentRoutes from './routes/fixedContent';
import usersRoutes from './routes/users';

// Load environment variables
dotenv.config();

// Função para criar usuários padrão
async function createDefaultUsers() {
  if (process.env.SEED_ON_STARTUP === 'false') {
    console.log('ℹ️ Seed automático desabilitado (SEED_ON_STARTUP=false).');
    return;
  }

  try {
    console.log('🔍 Verificando usuários padrão...');
    const result = await seed();
    if (result.executed) {
      console.log('✅ Usuários padrão configurados!');
    } else {
      console.log(result.reason ?? 'ℹ️ Seed já havia sido executado.');
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

// Health check
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await testConnection();
    
    res.json({ 
      status: 'healthy',
      message: 'JIMI IOT Brasil Dashboard API is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      message: 'Service unavailable',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Database connection failed'
    });
  }
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
    // Testar conexão com banco
    console.log('🔍 Testando conexão com banco de dados...');
  const connected = await testConnection(true);
    
    if (!connected) {
      throw new Error('Falha na conexão com banco de dados');
    }
    
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
