import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, CreateSlideRequest, UpdateSlideRequest } from '../types';

const prisma = new PrismaClient();

export const getAllSlides = async (req: AuthRequest, res: Response) => {
  try {
    const slides = await prisma.slide.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });

    res.json({ slides });
  } catch (error) {
    console.error('Get slides error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSlideById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const slide = await prisma.slide.findUnique({
      where: { id }
    });

    if (!slide) {
      return res.status(404).json({ message: 'Slide not found' });
    }

    res.json({ slide });
  } catch (error) {
    console.error('Get slide error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createSlide = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, duration = 10, order = 0 }: CreateSlideRequest = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const slide = await prisma.slide.create({
      data: {
        title,
        content,
        duration,
        order
      }
    });

    res.status(201).json({
      message: 'Slide created successfully',
      slide
    });
  } catch (error) {
    console.error('Create slide error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateSlide = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: UpdateSlideRequest = req.body;

    const slide = await prisma.slide.findUnique({
      where: { id }
    });

    if (!slide) {
      return res.status(404).json({ message: 'Slide not found' });
    }

    const updatedSlide = await prisma.slide.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Slide updated successfully',
      slide: updatedSlide
    });
  } catch (error) {
    console.error('Update slide error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteSlide = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const slide = await prisma.slide.findUnique({
      where: { id }
    });

    if (!slide) {
      return res.status(404).json({ message: 'Slide not found' });
    }

    await prisma.slide.delete({
      where: { id }
    });

    res.json({ message: 'Slide deleted successfully' });
  } catch (error) {
    console.error('Delete slide error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const reorderSlides = async (req: AuthRequest, res: Response) => {
  try {
    const { slideOrders } = req.body; // Array of { id: string, order: number }

    if (!Array.isArray(slideOrders)) {
      return res.status(400).json({ message: 'slideOrders must be an array' });
    }

    // Update all slides with new order
    const updatePromises = slideOrders.map(({ id, order }) =>
      prisma.slide.update({
        where: { id },
        data: { order }
      })
    );

    await Promise.all(updatePromises);

    res.json({ message: 'Slides reordered successfully' });
  } catch (error) {
    console.error('Reorder slides error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
