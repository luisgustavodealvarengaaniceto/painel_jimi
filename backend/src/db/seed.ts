import bcrypt from 'bcryptjs';
import { sql } from 'drizzle-orm';

import { db } from './index';
import { users, slides, fixedContent } from './schema';

const DEFAULT_ADMIN_PASSWORD = 'admin123';
const DEFAULT_VIEWER_PASSWORD = 'viewer123';
const AKROZ_PASSWORD = 'akroz123';

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
    const hashedAkrozPassword = await bcrypt.hash(AKROZ_PASSWORD, 10);

    await db
      .insert(users)
      .values([
        {
          username: 'admin',
          password: hashedAdminPassword,
          role: 'ADMIN',
          tenant: 'default',
        },
        {
          username: 'tv',
          password: hashedViewerPassword,
          role: 'VIEWER',
          tenant: 'default',
        },
        {
          username: 'akroz',
          password: hashedAkrozPassword,
          role: 'ADMIN',
          tenant: 'akroz',
        },
        {
          username: 'akroz-tv',
          password: hashedViewerPassword,
          role: 'VIEWER',
          tenant: 'akroz',
        },
      ])
      .onConflictDoNothing();

    console.log('✅ Usuários criados:');
    console.log('   - admin/admin123 (ADMIN, tenant: default)');
    console.log('   - tv/viewer123 (VIEWER, tenant: default)');
    console.log('   - akroz/akroz123 (ADMIN, tenant: akroz)');
    console.log('   - akroz-tv/viewer123 (VIEWER, tenant: akroz)');

    console.log('📊 Criando slides padrão...');

    const [{ slideCount }] = await db
      .select({ slideCount: sql<number>`COUNT(*)` })
      .from(slides);

    if (Number(slideCount) === 0) {
      await db
        .insert(slides)
        .values([
          {
            title: 'Bem-vindo ao JIMI IOT Brasil',
            content: '<h2>Sistema de Dashboard Profissional</h2><p>Monitore seus dispositivos em tempo real</p>',
            duration: 5000,
            order: 1,
            isActive: true,
            tenant: 'default',
          },
          {
            title: 'Bem-vindo à Akroz Telematics',
            content: '<h2>Soluções Inteligentes em Rastreamento</h2><p>Tecnologia de ponta para sua frota</p>',
            duration: 5000,
            order: 1,
            isActive: true,
            tenant: 'akroz',
          },
        ]);
      console.log('✅ Slides criados para ambos os tenants');
    }

    console.log('📄 Criando conteúdo fixo padrão...');

    const [{ fixedContentCount }] = await db
      .select({ fixedContentCount: sql<number>`COUNT(*)` })
      .from(fixedContent);

    if (Number(fixedContentCount) === 0) {
      await db
        .insert(fixedContent)
        .values([
          // Default tenant (JIMI)
          {
            type: 'logo',
            content: 'JIMI IOT BRASIL',
            isActive: true,
            order: 1,
            tenant: 'default',
          },
          {
            type: 'footer',
            content: 'Tecnologia Inteligente para o Futuro',
            isActive: true,
            order: 2,
            tenant: 'default',
          },
          // Akroz tenant
          {
            type: 'logo',
            content: 'AKROZ TELEMATICS',
            isActive: true,
            order: 1,
            tenant: 'akroz',
          },
          {
            type: 'footer',
            content: 'Rastreamento Inteligente e Seguro',
            isActive: true,
            order: 2,
            tenant: 'akroz',
          },
        ]);
      console.log('✅ Conteúdo fixo criado para ambos os tenants');
    }

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