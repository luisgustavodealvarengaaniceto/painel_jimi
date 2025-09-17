import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      role: 'ADMIN'
    }
  });

  // Create viewer user for TV
  const viewerPassword = await bcrypt.hash('viewer123', 10);
  const viewer = await prisma.user.upsert({
    where: { username: 'tv' },
    update: {},
    create: {
      username: 'tv',
      password: viewerPassword,
      role: 'VIEWER'
    }
  });

  // Create sample fixed content
  await prisma.fixedContent.upsert({
    where: { id: 'logo-content' },
    update: {},
    create: {
      id: 'logo-content',
      type: 'logo',
      content: 'JIMI IOT BRASIL',
      order: 0
    }
  });

  await prisma.fixedContent.upsert({
    where: { id: 'datetime-content' },
    update: {},
    create: {
      id: 'datetime-content',
      type: 'datetime',
      content: 'Data e Hora Atual',
      order: 1
    }
  });

  await prisma.fixedContent.upsert({
    where: { id: 'welcome-content' },
    update: {},
    create: {
      id: 'welcome-content',
      type: 'announcement',
      content: 'Bem-vindos à JIMI IOT Brasil',
      order: 2
    }
  });

  // Create sample slides
  await prisma.slide.upsert({
    where: { id: 'slide-1' },
    update: {},
    create: {
      id: 'slide-1',
      title: 'Bem-vindos à JIMI IOT Brasil',
      content: '<h2>Inovação em IoT</h2><p>Transformando o futuro com tecnologia inteligente e soluções conectadas.</p>',
      duration: 15,
      order: 0
    }
  });

  await prisma.slide.upsert({
    where: { id: 'slide-2' },
    update: {},
    create: {
      id: 'slide-2',
      title: 'Nossos Valores',
      content: '<h2>Excelência e Inovação</h2><ul><li>Qualidade Superior</li><li>Atendimento Personalizado</li><li>Tecnologia de Ponta</li><li>Sustentabilidade</li></ul>',
      duration: 12,
      order: 1
    }
  });

  await prisma.slide.upsert({
    where: { id: 'slide-3' },
    update: {},
    create: {
      id: 'slide-3',
      title: 'Contato',
      content: '<h2>Entre em Contato</h2><p>📧 contato@jimiiot.com.br</p><p>📱 (11) 9999-9999</p><p>🌐 www.jimiiot.com.br</p>',
      duration: 10,
      order: 2
    }
  });

  console.log('✅ Seed completed!');
  console.log('👤 Admin user: admin / admin123');
  console.log('📺 TV user: tv / viewer123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
