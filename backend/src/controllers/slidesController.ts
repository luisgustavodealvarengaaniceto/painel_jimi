import type { Request, Response } from 'express';
import { asc, desc, eq, sql, and } from 'drizzle-orm';

import { db } from '../db';
import { slides } from '../db/schema';
import type { CreateSlideRequest, UpdateSlideRequest, AuthRequest } from '../types';
import { serializeSlide } from '../utils/serializers';

const getNextSlideOrder = async () => {
  const [result] = await db.select({ maxOrder: sql<number>`COALESCE(MAX(${slides.order}), 0)` }).from(slides);
  return (result?.maxOrder ?? 0) + 1;
};

export const getAllSlides = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔍 [getAllSlides] Consultando slides...');
    
    const tenant = req.user?.tenant || 'default';
    const isAdmin = req.user?.role === 'ADMIN';
    console.log(`🏢 [getAllSlides] Tenant: ${tenant}, Role: ${req.user?.role}`);
    
    let items;
    
    if (isAdmin) {
      // Admin vê todos os slides (ativos e inativos, mas não arquivados)
      items = await db
        .select()
        .from(slides)
        .where(and(
          eq(slides.isArchived, false),
          eq(slides.tenant, tenant)
        ))
        .orderBy(asc(slides.order), asc(slides.id));
      
      console.log(`👑 [getAllSlides] Admin - Retornando todos os slides não arquivados: ${items.length}`);
    } else {
      // Viewer vê apenas slides ativos, não arquivados e não expirados
      items = await db
        .select()
        .from(slides)
        .where(and(
          eq(slides.isActive, true),
          eq(slides.isArchived, false),
          eq(slides.tenant, tenant)
        ))
        .orderBy(asc(slides.order), asc(slides.id));
      
      // Filtrar slides expirados
      const now = new Date();
      items = items.filter(slide => !slide.expiresAt || new Date(slide.expiresAt) > now);
      
      console.log(`📺 [getAllSlides] Viewer - Retornando slides ativos e não expirados: ${items.length}`);
    }

    console.log(`📊 [getAllSlides] Total de slides encontrados: ${items.length}`);
    items.forEach((slide, idx) => {
      console.log(`   ${idx + 1}. [ID ${slide.id}] "${slide.title}" - tenant: ${slide.tenant}, isActive: ${slide.isActive}, isArchived: ${slide.isArchived}, expiresAt: ${slide.expiresAt || 'null'}`);
    });

    const serialized = items.map(serializeSlide);
    console.log(`✅ [getAllSlides] Retornando ${serialized.length} slides para o frontend`);
    
    return res.json({ slides: serialized });
  } catch (error) {
    console.error('❌ [getAllSlides] Erro ao buscar slides:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSlideById = async (req: AuthRequest, res: Response) => {
  try {
    const slideId = Number(req.params.id);

    if (Number.isNaN(slideId)) {
      return res.status(400).json({ message: 'Invalid slide id' });
    }

    const tenant = req.user?.tenant || 'default';

    const [slide] = await db
      .select()
      .from(slides)
      .where(and(
        eq(slides.id, slideId),
        eq(slides.tenant, tenant)
      ))
      .limit(1);

    if (!slide) {
      return res.status(404).json({ message: 'Slide not found' });
    }

    return res.json({ slide: serializeSlide(slide) });
  } catch (error) {
    console.error('Get slide by id error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createSlide = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, duration, order, isActive, expiresAt, fontSize } = req.body as CreateSlideRequest;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const tenant = req.user?.tenant || 'default';
    console.log(`🆕 [createSlide] Criando slide "${title}" para tenant: ${tenant}`);
    console.log(`👤 [createSlide] Usuário: ${req.user?.username} (ID: ${req.user?.id}, tenant: ${req.user?.tenant})`);
    
    const resolvedOrder = typeof order === 'number' ? order : await getNextSlideOrder();

    const [newSlide] = await db
      .insert(slides)
      .values({
        title,
        content,
        duration: typeof duration === 'number' ? duration : 5000,
        order: resolvedOrder,
        isActive: typeof isActive === 'boolean' ? isActive : true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        fontSize: typeof fontSize === 'number' ? fontSize : 16,
        isArchived: false,
        tenant,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return res.status(201).json({
      message: 'Slide created successfully',
      slide: serializeSlide(newSlide),
    });
  } catch (error) {
    console.error('Create slide error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateSlide = async (req: AuthRequest, res: Response) => {
  try {
    const slideId = Number(req.params.id);

    if (Number.isNaN(slideId)) {
      return res.status(400).json({ message: 'Invalid slide id' });
    }

    const { title, content, duration, order, isActive, expiresAt, isArchived, fontSize } = req.body as UpdateSlideRequest;
    const tenant = req.user?.tenant || 'default';

    const updateData: Partial<typeof slides.$inferInsert> = {};

    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (duration !== undefined) updateData.duration = duration;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (isArchived !== undefined) updateData.isArchived = isArchived;
    if (fontSize !== undefined) updateData.fontSize = fontSize;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No fields provided for update' });
    }

    updateData.updatedAt = new Date();

    const [updatedSlide] = await db
      .update(slides)
      .set(updateData)
      .where(and(
        eq(slides.id, slideId),
        eq(slides.tenant, tenant)
      ))
      .returning();

    if (!updatedSlide) {
      return res.status(404).json({ message: 'Slide not found' });
    }

    return res.json({
      message: 'Slide updated successfully',
      slide: serializeSlide(updatedSlide),
    });
  } catch (error) {
    console.error('Update slide error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteSlide = async (req: AuthRequest, res: Response) => {
  try {
    const slideId = Number(req.params.id);

    if (Number.isNaN(slideId)) {
      return res.status(400).json({ message: 'Invalid slide id' });
    }

    const tenant = req.user?.tenant || 'default';

    const [deletedSlide] = await db
      .delete(slides)
      .where(and(
        eq(slides.id, slideId),
        eq(slides.tenant, tenant)
      ))
      .returning({ id: slides.id });

    if (!deletedSlide) {
      return res.status(404).json({ message: 'Slide not found' });
    }

    return res.status(204).send();
  } catch (error) {
    console.error('Delete slide error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const reorderSlides = async (req: Request, res: Response) => {
  try {
    const { slideOrders } = req.body as { slideOrders?: { id: string | number; order: number }[] };

    if (!Array.isArray(slideOrders) || slideOrders.length === 0) {
      return res.status(400).json({ message: 'slideOrders array is required' });
    }

    const parsedOrders = slideOrders.map((item) => ({
      id: Number(item.id),
      order: item.order,
    }));

    if (parsedOrders.some((item) => Number.isNaN(item.id) || !Number.isInteger(item.order))) {
      return res.status(400).json({ message: 'Invalid slideOrders payload' });
    }

    await db.transaction(async (tx) => {
      for (const item of parsedOrders) {
        await tx
          .update(slides)
          .set({ order: item.order, updatedAt: new Date() })
          .where(eq(slides.id, item.id));
      }
    });

    return res.json({ message: 'Slides reordered successfully' });
  } catch (error) {
    console.error('Reorder slides error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getArchivedSlides = async (req: AuthRequest, res: Response) => {
  try {
    const tenant = req.user?.tenant || 'default';
    const isAdmin = req.user?.role === 'ADMIN';

    // Apenas admins podem ver slides arquivados
    if (!isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    console.log(`📦 [getArchivedSlides] Admin buscando slides arquivados para tenant: ${tenant}`);

    const archivedSlides = await db
      .select()
      .from(slides)
      .where(and(
        eq(slides.isArchived, true),
        eq(slides.tenant, tenant)
      ))
      .orderBy(desc(slides.updatedAt));

    // Separar slides expirados dos manualmente arquivados
    const now = new Date();
    const expiredSlides = archivedSlides.filter(slide => 
      slide.expiresAt && new Date(slide.expiresAt) <= now
    );
    const manuallyArchived = archivedSlides.filter(slide => 
      !slide.expiresAt || new Date(slide.expiresAt) > now
    );

    console.log(`📦 [getArchivedSlides] Total arquivados: ${archivedSlides.length}`);
    console.log(`⏰ [getArchivedSlides] Expirados: ${expiredSlides.length}`);
    console.log(`📁 [getArchivedSlides] Manualmente arquivados: ${manuallyArchived.length}`);

    const serializedExpired = expiredSlides.map(serializeSlide);
    const serializedManual = manuallyArchived.map(serializeSlide);

    return res.json({ 
      expiredSlides: serializedExpired,
      manuallyArchivedSlides: serializedManual,
      total: archivedSlides.length
    });
  } catch (error) {
    console.error('❌ [getArchivedSlides] Erro ao buscar slides arquivados:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};