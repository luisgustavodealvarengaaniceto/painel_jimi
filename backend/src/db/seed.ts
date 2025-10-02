import bcrypt from 'bcryptjs';
import { sql } from 'drizzle-orm';

import { db } from './index';
import { users, slides, fixedContent } from './schema';

const DEFAULT_ADMIN_PASSWORD = 'admin123';
const DEFAULT_VIEWER_PASSWORD = 'viewer123';

export interface SeedResult {
  executed: boolean;
  reason?: string;
}

async function seed(): Promise<SeedResult> {
  console.log('🌱 Iniciando seed do banco de dados...');

  try {
    const forceSeed = process.env.FORCE_SEED === 'true';

    const [{ userCount }] = await db
      .select({ userCount: sql<number>`COUNT(*)` })
      .from(users);

    if (!forceSeed && Number(userCount) > 0) {
      const reason = 'ℹ️ Seed já executado anteriormente — pulando criação de dados padrão.';
      console.log(reason);
      return { executed: false, reason };
    }

    console.log('👥 Criando usuários padrão...');

    const hashedAdminPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
    const hashedViewerPassword = await bcrypt.hash(DEFAULT_VIEWER_PASSWORD, 10);

    await db
      .insert(users)
      .values([
        {
          username: 'admin',
          password: hashedAdminPassword,
          role: 'ADMIN',
        },
        {
          username: 'tv',
          password: hashedViewerPassword,
          role: 'VIEWER',
        },
      ])
      .onConflictDoNothing();

    console.log('✅ Usuários criados: admin/admin123, tv/viewer123');

    console.log('📊 Criando slides padrão...');

    await db
      .insert(slides)
      .values([
        {
          title: 'Bem-vindo ao JIMI IOT Brasil',
          content: 'Sistema de Dashboard Profissional',
          duration: 5000,
          order: 1,
          isActive: true,
        },
      ])
      .onConflictDoNothing();

    console.log('📄 Criando conteúdo fixo padrão...');

    await db
      .insert(fixedContent)
      .values([
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
        },
      ])
      .onConflictDoNothing();

    console.log('✅ Seed concluído com sucesso!');
    return { executed: true };
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    throw error;
  }
}

// Executar seed se arquivo for chamado diretamente
if (require.main === module) {
  seed()
    .then((result) => {
      if (result.executed) {
        console.log('🎉 Seed finalizado!');
      } else {
        console.log(result.reason ?? 'ℹ️ Seed pulado.');
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seed falhou:', error);
      process.exit(1);
    });
}

export default seed;