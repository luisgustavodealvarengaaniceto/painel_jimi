import { db } from '../db';
import { slides } from '../db/schema';
import { and, lte, eq } from 'drizzle-orm';

/**
 * Arquiva slides que expiraram
 */
export async function archiveExpiredSlides() {
  try {
    console.log(`🔍 [archiveExpiredSlides] Verificando slides expirados em ${new Date().toISOString()}`);
    
    const now = new Date();
    
    // Buscar slides não arquivados que expiraram
    const expiredSlides = await db
      .select()
      .from(slides)
      .where(
        and(
          eq(slides.isArchived, false),
          lte(slides.expiresAt, now)
        )
      );
    
    console.log(`📊 [archiveExpiredSlides] Encontrados ${expiredSlides.length} slides expirados`);
    
    if (expiredSlides.length === 0) {
      console.log('ℹ️ [archiveExpiredSlides] Nenhum slide expirado encontrado');
      return;
    }
    
    // Arquivar cada slide expirado
    for (const slide of expiredSlides) {
      await db
        .update(slides)
        .set({ isArchived: true })
        .where(eq(slides.id, slide.id));
      
      console.log(`🗃️ [archiveExpiredSlides] Slide "${slide.title}" (ID: ${slide.id}) arquivado automaticamente`);
    }
    
    console.log(`✅ [archiveExpiredSlides] ${expiredSlides.length} slides arquivados com sucesso`);
  } catch (error) {
    console.error('❌ [archiveExpiredSlides] Erro ao arquivar slides:', error);
  }
}

/**
 * Inicia o job periódico de arquivamento
 */
export function startExpirationJob() {
  console.log('🚀 [startExpirationJob] Iniciando job de arquivamento');
  
  // Executar imediatamente ao iniciar
  archiveExpiredSlides();
  
  // Executar a cada 1 minuto (60000ms)
  const interval = 60000;
  setInterval(() => {
    console.log('⏰ [startExpirationJob] Executando verificação periódica');
    archiveExpiredSlides();
  }, interval);
  
  console.log(`⏰ Job de arquivamento de slides iniciado (executa a cada ${interval / 1000} segundos)`);
}
