import type { Request, Response } from 'express';
import { asc, eq, sql } from 'drizzle-orm';

import { db } from '../db';
import { slides } from '../db/schema';
import type { CreateSlideRequest, UpdateSlideRequest } from '../types';
import { serializeSlide } from '../utils/serializers';

const getNextSlideOrder = async () => {
  const [result] = await db.select({ maxOrder: sql<number>`COALESCE(MAX(${slides.order}), 0)` }).from(slides);
  return (result?.maxOrder ?? 0) + 1;
};

export const getAllSlides = async (_req: Request, res: Response) => {
  try {
    const items = await db
      .select()
      .from(slides)
      .orderBy(asc(slides.order), asc(slides.id));

    return res.json({ slides: items.map(serializeSlide) });
  } catch (error) {
    console.error('Get all slides error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSlideById = async (req: Request, res: Response) => {
  try {
    const slideId = Number(req.params.id);

    if (Number.isNaN(slideId)) {
      return res.status(400).json({ message: 'Invalid slide id' });
    }

    const [slide] = await db.select().from(slides).where(eq(slides.id, slideId)).limit(1);

    if (!slide) {
      return res.status(404).json({ message: 'Slide not found' });
    }

    return res.json({ slide: serializeSlide(slide) });
  } catch (error) {
    console.error('Get slide by id error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createSlide = async (req: Request, res: Response) => {
  try {
    const { title, content, duration, order, isActive } = req.body as CreateSlideRequest;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const resolvedOrder = typeof order === 'number' ? order : await getNextSlideOrder();

    const [newSlide] = await db
      .insert(slides)
      .values({
        title,
        content,
        duration: typeof duration === 'number' ? duration : 5000,
        order: resolvedOrder,
        isActive: typeof isActive === 'boolean' ? isActive : true,
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

export const updateSlide = async (req: Request, res: Response) => {
  try {
    const slideId = Number(req.params.id);

    if (Number.isNaN(slideId)) {
      return res.status(400).json({ message: 'Invalid slide id' });
    }

    const { title, content, duration, order, isActive } = req.body as UpdateSlideRequest;

    const updateData: Partial<typeof slides.$inferInsert> = {};

    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (duration !== undefined) updateData.duration = duration;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No fields provided for update' });
    }

    updateData.updatedAt = new Date();

    const [updatedSlide] = await db
      .update(slides)
      .set(updateData)
      .where(eq(slides.id, slideId))
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

export const deleteSlide = async (req: Request, res: Response) => {
  try {
    const slideId = Number(req.params.id);

    if (Number.isNaN(slideId)) {
      return res.status(400).json({ message: 'Invalid slide id' });
    }

    const [deletedSlide] = await db
      .delete(slides)
      .where(eq(slides.id, slideId))
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