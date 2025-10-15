import type { Request, Response } from 'express';
import { asc, eq, and } from 'drizzle-orm';

import { db } from '../db';
import { fixedContent } from '../db/schema';
import type { CreateFixedContentRequest, UpdateFixedContentRequest, AuthRequest } from '../types';
import { serializeFixedContent } from '../utils/serializers';

export const getAllFixedContent = async (req: AuthRequest, res: Response) => {
  try {
    const tenant = req.user?.tenant || 'default';
    
    const items = await db
      .select()
      .from(fixedContent)
      .where(eq(fixedContent.tenant, tenant))
      .orderBy(asc(fixedContent.order), asc(fixedContent.id));

    return res.json({ content: items.map(serializeFixedContent) });
  } catch (error) {
    console.error('Get all fixed content error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getFixedContentById = async (req: AuthRequest, res: Response) => {
  try {
    const contentId = Number(req.params.id);

    if (Number.isNaN(contentId)) {
      return res.status(400).json({ message: 'Invalid fixed content id' });
    }

    const tenant = req.user?.tenant || 'default';

    const [item] = await db
      .select()
      .from(fixedContent)
      .where(and(
        eq(fixedContent.id, contentId),
        eq(fixedContent.tenant, tenant)
      ))
      .limit(1);

    if (!item) {
      return res.status(404).json({ message: 'Fixed content not found' });
    }

    return res.json({ content: serializeFixedContent(item) });
  } catch (error) {
    console.error('Get fixed content by id error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createFixedContent = async (req: AuthRequest, res: Response) => {
  try {
    const { type, content, order, isActive, fontSize } = req.body as CreateFixedContentRequest;

    if (!type || !content) {
      return res.status(400).json({ message: 'Type and content are required' });
    }

    const tenant = req.user?.tenant || 'default';

    const [newItem] = await db
      .insert(fixedContent)
      .values({
        type,
        content,
        order: typeof order === 'number' ? order : 0,
        isActive: typeof isActive === 'boolean' ? isActive : true,
        fontSize: typeof fontSize === 'number' ? fontSize : 14,
        tenant,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return res.status(201).json({
      message: 'Fixed content created successfully',
      content: serializeFixedContent(newItem),
    });
  } catch (error) {
    console.error('Create fixed content error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateFixedContent = async (req: AuthRequest, res: Response) => {
  try {
    const contentId = Number(req.params.id);

    if (Number.isNaN(contentId)) {
      return res.status(400).json({ message: 'Invalid fixed content id' });
    }

    const { type, content: bodyContent, isActive, order, fontSize } = req.body as UpdateFixedContentRequest;
    const tenant = req.user?.tenant || 'default';

    const updateData: Partial<typeof fixedContent.$inferInsert> = {};

    if (type !== undefined) updateData.type = type;
    if (bodyContent !== undefined) updateData.content = bodyContent;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (order !== undefined) updateData.order = order;
    if (fontSize !== undefined) updateData.fontSize = fontSize;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No fields provided for update' });
    }

    updateData.updatedAt = new Date();

    const [updatedItem] = await db
      .update(fixedContent)
      .set(updateData)
      .where(and(
        eq(fixedContent.id, contentId),
        eq(fixedContent.tenant, tenant)
      ))
      .returning();

    if (!updatedItem) {
      return res.status(404).json({ message: 'Fixed content not found' });
    }

    return res.json({
      message: 'Fixed content updated successfully',
      content: serializeFixedContent(updatedItem),
    });
  } catch (error) {
    console.error('Update fixed content error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteFixedContent = async (req: AuthRequest, res: Response) => {
  try {
    const contentId = Number(req.params.id);

    if (Number.isNaN(contentId)) {
      return res.status(400).json({ message: 'Invalid fixed content id' });
    }

    const tenant = req.user?.tenant || 'default';

    const [deletedItem] = await db
      .delete(fixedContent)
      .where(and(
        eq(fixedContent.id, contentId),
        eq(fixedContent.tenant, tenant)
      ))
      .returning({ id: fixedContent.id });

    if (!deletedItem) {
      return res.status(404).json({ message: 'Fixed content not found' });
    }

    return res.status(204).send();
  } catch (error) {
    console.error('Delete fixed content error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
