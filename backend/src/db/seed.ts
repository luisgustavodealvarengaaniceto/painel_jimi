import bcrypt from 'bcryptjs';
import { db } from './index';
import { users, slides, fixedContent } from './schema';

async function seed() {
  console.log('🌱 Iniciando seed do banco de dados...');

  try {
    // Criar usuários padrão
    console.log('👥 Criando usuários padrão...');
    
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedViewerPassword = await bcrypt.hash('viewer123', 10);

    await db.insert(users).values([
      {
        username: 'admin',
        password: hashedAdminPassword,
        role: 'ADMIN',
      },
      {
        username: 'tv',
        password: hashedViewerPassword,
        role: 'VIEWER',
      }
    ]).onConflictDoNothing();

    console.log('✅ Usuários criados: admin/admin123, tv/viewer123');

    // Criar slide padrão
    console.log('📊 Criando slides padrão...');
    
    await db.insert(slides).values([
      {
        title: 'Bem-vindo ao JIMI IOT Brasil',
        content: 'Sistema de Dashboard Profissional',
        duration: 5000,
        order: 1,
        isActive: true,
      }
    ]).onConflictDoNothing();

    // Criar conteúdo fixo padrão
    console.log('📄 Criando conteúdo fixo padrão...');
    
    await db.insert(fixedContent).values([
      {
        type: 'logo',
        content: 'JIMI IOT BRASIL',
        isActive: true,
        order: 1,
      },
      {
        type: 'footer',
        content: 'Tecnologia Inteligente para o Futuro',
        isActive: true,
        order: 2,
      }
    ]).onConflictDoNothing();

    console.log('✅ Seed concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    throw error;
  }
}

// Executar seed se arquivo for chamado diretamente
if (require.main === module) {
  seed()
    .then(() => {
      console.log('🎉 Seed finalizado!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seed falhou:', error);
      process.exit(1);
    });
}

export default seed;