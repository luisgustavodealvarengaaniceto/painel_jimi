import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, CreateFixedContentRequest, UpdateFixedContentRequest } from '../types';

const prisma = new PrismaClient();

export const getAllFixedContent = async (req: AuthRequest, res: Response) => {
  try {
    const content = await prisma.fixedContent.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });

    res.json({ content });
  } catch (error) {
    console.error('Get fixed content error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getFixedContentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const content = await prisma.fixedContent.findUnique({
      where: { id }
    });

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    res.json({ content });
  } catch (error) {
    console.error('Get fixed content error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createFixedContent = async (req: AuthRequest, res: Response) => {
  try {
    const { type, content, order = 0 }: CreateFixedContentRequest = req.body;

    if (!type || !content) {
      return res.status(400).json({ message: 'Type and content are required' });
    }

    const newContent = await prisma.fixedContent.create({
      data: {
        type,
        content,
        order
      }
    });

    res.status(201).json({
      message: 'Fixed content created successfully',
      content: newContent
    });
  } catch (error) {
    console.error('Create fixed content error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateFixedContent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: UpdateFixedContentRequest = req.body;

    const content = await prisma.fixedContent.findUnique({
      where: { id }
    });

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    const updatedContent = await prisma.fixedContent.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Fixed content updated successfully',
      content: updatedContent
    });
  } catch (error) {
    console.error('Update fixed content error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteFixedContent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const content = await prisma.fixedContent.findUnique({
      where: { id }
    });

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    await prisma.fixedContent.delete({
      where: { id }
    });

    res.json({ message: 'Fixed content deleted successfully' });
  } catch (error) {
    console.error('Delete fixed content error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
