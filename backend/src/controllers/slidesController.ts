import { Response } from 'express';import { Response } from 'express';import { Response } from 'express';

import { db } from '../db';

import { slides } from '../db/schema';import { db } from '../db';import { db } from '../db';

import { eq } from 'drizzle-orm';

import { AuthRequest, CreateSlideRequest, UpdateSlideRequest } from '../types';import { slides } from '../db/schema';import { slides } from '../db/schema';



export const getAllSlides = async (req: AuthRequest, res: Response) => {import { eq } from 'drizzle-orm';import { eq, and } from 'drizzle-orm';

  try {

    const slidesList = await db.select().from(slides)import { AuthRequest, CreateSlideRequest, UpdateSlideRequest } from '../types';import { AuthRequest, CreateSlideRequest, UpdateSlideRequest } from '../types';

      .where(eq(slides.isActive, true))

      .orderBy(slides.order);



    res.json({ slides: slidesList });export const getAllSlides = async (req: AuthRequest, res: Response) => {export const getAllSlides = async (req: AuthRequest, res: Response) => {

  } catch (error) {

    console.error('Get slides error:', error);  try {  try {

    res.status(500).json({ message: 'Internal server error' });

  }    const slidesList = await db.select().from(slides)    const slidesList = await db.select().from(slides)

};

      .where(eq(slides.isActive, true))      .where(eq(slides.isActive, true))

export const getSlideById = async (req: AuthRequest, res: Response) => {

  try {      .orderBy(slides.order);      .orderBy(slides.order);

    const { id } = req.params;

    const slideResult = await db.select().from(slides)

      .where(eq(slides.id, parseInt(id)))

      .limit(1);    res.json({ slides: slidesList });    res.json({ slides: slidesList });



    const slide = slideResult[0];  } catch (error) {  } catch (error) {



    if (!slide) {    console.error('Get slides error:', error);    console.error('Get slides error:', error);

      return res.status(404).json({ message: 'Slide not found' });

    }    res.status(500).json({ message: 'Internal server error' });    res.status(500).json({ message: 'Internal server error' });



    res.json({ slide });  }  }

  } catch (error) {

    console.error('Get slide error:', error);};};

    res.status(500).json({ message: 'Internal server error' });

  }

};

export const getSlideById = async (req: AuthRequest, res: Response) => {export const getSlideById = async (req: AuthRequest, res: Response) => {

export const createSlide = async (req: AuthRequest, res: Response) => {

  try {  try {  try {

    const { title, content, duration, order }: CreateSlideRequest = req.body;

    const { id } = req.params;    const { id } = req.params;

    if (!title || !content) {

      return res.status(400).json({ message: 'Title and content are required' });    const slideResult = await db.select().from(slides)

    }

      .where(eq(slides.id, parseInt(id)))    const slide = await prisma.slide.findUnique({

    const newSlideResult = await db.insert(slides).values({

      title,      .limit(1);      where: { id }

      content,

      duration: duration || 5000,    });

      order: order || 0,

      isActive: true    const slide = slideResult[0];

    }).returning();

    if (!slide) {

    const slide = newSlideResult[0];

    if (!slide) {      return res.status(404).json({ message: 'Slide not found' });

    res.status(201).json({

      message: 'Slide created successfully',      return res.status(404).json({ message: 'Slide not found' });    }

      slide

    });    }

  } catch (error) {

    console.error('Create slide error:', error);    res.json({ slide });

    res.status(500).json({ message: 'Internal server error' });

  }    res.json({ slide });  } catch (error) {

};

  } catch (error) {    console.error('Get slide error:', error);

export const updateSlide = async (req: AuthRequest, res: Response) => {

  try {    console.error('Get slide error:', error);    res.status(500).json({ message: 'Internal server error' });

    const { id } = req.params;

    const { title, content, duration, order, isActive }: UpdateSlideRequest = req.body;    res.status(500).json({ message: 'Internal server error' });  }



    const existingSlideResult = await db.select().from(slides)  }};

      .where(eq(slides.id, parseInt(id)))

      .limit(1);};



    if (!existingSlideResult[0]) {export const createSlide = async (req: AuthRequest, res: Response) => {

      return res.status(404).json({ message: 'Slide not found' });

    }export const createSlide = async (req: AuthRequest, res: Response) => {  try {



    const updatedSlideResult = await db.update(slides)  try {    const { title, content, duration = 10, order = 0 }: CreateSlideRequest = req.body;

      .set({

        title,    const { title, content, duration, order }: CreateSlideRequest = req.body;

        content,

        duration,    if (!title || !content) {

        order,

        isActive,    if (!title || !content) {      return res.status(400).json({ message: 'Title and content are required' });

        updatedAt: new Date()

      })      return res.status(400).json({ message: 'Title and content are required' });    }

      .where(eq(slides.id, parseInt(id)))

      .returning();    }



    const updatedSlide = updatedSlideResult[0];    const slide = await prisma.slide.create({



    res.json({    const newSlideResult = await db.insert(slides).values({      data: {

      message: 'Slide updated successfully',

      slide: updatedSlide      title,        title,

    });

  } catch (error) {      content,        content,

    console.error('Update slide error:', error);

    res.status(500).json({ message: 'Internal server error' });      duration: duration || 5000,        duration,

  }

};      order: order || 0,        order



export const deleteSlide = async (req: AuthRequest, res: Response) => {      isActive: true      }

  try {

    const { id } = req.params;    }).returning();    });



    const existingSlideResult = await db.select().from(slides)

      .where(eq(slides.id, parseInt(id)))

      .limit(1);    const slide = newSlideResult[0];    res.status(201).json({



    if (!existingSlideResult[0]) {      message: 'Slide created successfully',

      return res.status(404).json({ message: 'Slide not found' });

    }    res.status(201).json({      slide



    await db.delete(slides).where(eq(slides.id, parseInt(id)));      message: 'Slide created successfully',    });



    res.json({ message: 'Slide deleted successfully' });      slide  } catch (error) {

  } catch (error) {

    console.error('Delete slide error:', error);    });    console.error('Create slide error:', error);

    res.status(500).json({ message: 'Internal server error' });

  }  } catch (error) {    res.status(500).json({ message: 'Internal server error' });

};

    console.error('Create slide error:', error);  }

export const reorderSlides = async (req: AuthRequest, res: Response) => {

  try {    res.status(500).json({ message: 'Internal server error' });};

    const { slideOrders }: { slideOrders: { id: number; order: number }[] } = req.body;

  }

    if (!slideOrders || !Array.isArray(slideOrders)) {

      return res.status(400).json({ message: 'Slide orders array is required' });};export const updateSlide = async (req: AuthRequest, res: Response) => {

    }

  try {

    const updatePromises = slideOrders.map(({ id, order }) =>

      db.update(slides)export const updateSlide = async (req: AuthRequest, res: Response) => {    const { id } = req.params;

        .set({ order, updatedAt: new Date() })

        .where(eq(slides.id, id))  try {    const updateData: UpdateSlideRequest = req.body;

    );

    const { id } = req.params;

    await Promise.all(updatePromises);

    const { title, content, duration, order, isActive }: UpdateSlideRequest = req.body;    const slide = await prisma.slide.findUnique({

    res.json({ message: 'Slides reordered successfully' });

  } catch (error) {      where: { id }

    console.error('Reorder slides error:', error);

    res.status(500).json({ message: 'Internal server error' });    // Check if slide exists    });

  }

};    const existingSlideResult = await db.select().from(slides)

      .where(eq(slides.id, parseInt(id)))    if (!slide) {

      .limit(1);      return res.status(404).json({ message: 'Slide not found' });

    }

    if (!existingSlideResult[0]) {

      return res.status(404).json({ message: 'Slide not found' });    const updatedSlide = await prisma.slide.update({

    }      where: { id },

      data: updateData

    const updatedSlideResult = await db.update(slides)    });

      .set({

        title,    res.json({

        content,      message: 'Slide updated successfully',

        duration,      slide: updatedSlide

        order,    });

        isActive,  } catch (error) {

        updatedAt: new Date()    console.error('Update slide error:', error);

      })    res.status(500).json({ message: 'Internal server error' });

      .where(eq(slides.id, parseInt(id)))  }

      .returning();};



    const updatedSlide = updatedSlideResult[0];export const deleteSlide = async (req: AuthRequest, res: Response) => {

  try {

    res.json({    const { id } = req.params;

      message: 'Slide updated successfully',

      slide: updatedSlide    const slide = await prisma.slide.findUnique({

    });      where: { id }

  } catch (error) {    });

    console.error('Update slide error:', error);

    res.status(500).json({ message: 'Internal server error' });    if (!slide) {

  }      return res.status(404).json({ message: 'Slide not found' });

};    }



export const deleteSlide = async (req: AuthRequest, res: Response) => {    await prisma.slide.delete({

  try {      where: { id }

    const { id } = req.params;    });



    // Check if slide exists    res.json({ message: 'Slide deleted successfully' });

    const existingSlideResult = await db.select().from(slides)  } catch (error) {

      .where(eq(slides.id, parseInt(id)))    console.error('Delete slide error:', error);

      .limit(1);    res.status(500).json({ message: 'Internal server error' });

  }

    if (!existingSlideResult[0]) {};

      return res.status(404).json({ message: 'Slide not found' });

    }export const reorderSlides = async (req: AuthRequest, res: Response) => {

  try {

    await db.delete(slides).where(eq(slides.id, parseInt(id)));    const { slideOrders } = req.body; // Array of { id: string, order: number }



    res.json({ message: 'Slide deleted successfully' });    if (!Array.isArray(slideOrders)) {

  } catch (error) {      return res.status(400).json({ message: 'slideOrders must be an array' });

    console.error('Delete slide error:', error);    }

    res.status(500).json({ message: 'Internal server error' });

  }    // Update all slides with new order

};    const updatePromises = slideOrders.map(({ id, order }) =>

      prisma.slide.update({

export const reorderSlides = async (req: AuthRequest, res: Response) => {        where: { id },

  try {        data: { order }

    const { slideOrders }: { slideOrders: { id: number; order: number }[] } = req.body;      })

    );

    if (!slideOrders || !Array.isArray(slideOrders)) {

      return res.status(400).json({ message: 'Slide orders array is required' });    await Promise.all(updatePromises);

    }

    res.json({ message: 'Slides reordered successfully' });

    // Update each slide's order  } catch (error) {

    const updatePromises = slideOrders.map(({ id, order }) =>    console.error('Reorder slides error:', error);

      db.update(slides)    res.status(500).json({ message: 'Internal server error' });

        .set({ order, updatedAt: new Date() })  }

        .where(eq(slides.id, id))};

    );

    await Promise.all(updatePromises);

    res.json({ message: 'Slides reordered successfully' });
  } catch (error) {
    console.error('Reorder slides error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};