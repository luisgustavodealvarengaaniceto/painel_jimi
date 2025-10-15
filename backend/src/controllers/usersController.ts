import type { Request, Response } from 'express';
import { asc, eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

import { db } from '../db';
import { users } from '../db/schema';
import type { CreateUserRequest, UpdateUserRequest } from '../types';
import { serializeUser } from '../utils/serializers';

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const result = await db
      .select({
        id: users.id,
        username: users.username,
        role: users.role,
        tenant: users.tenant,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .orderBy(asc(users.createdAt), asc(users.id));

    return res.json(result.map(serializeUser));
  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);

    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        role: users.role,
        tenant: users.tenant,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(serializeUser(user));
  } catch (error) {
    console.error('Get user by id error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, password, role = 'VIEWER' } = req.body as CreateUserRequest;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const [existingUser] = await db.select().from(users).where(eq(users.username, username)).limit(1);

    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        username,
        password: hashedPassword,
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return res.status(201).json(serializeUser(newUser));
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);

    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const { username, password, role } = req.body as UpdateUserRequest;

    const updateData: Partial<typeof users.$inferInsert> = {};

    if (username !== undefined) updateData.username = username;
    if (role !== undefined) updateData.role = role;

    if (password !== undefined && password.length > 0) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No fields provided for update' });
    }

    updateData.updatedAt = new Date();

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(serializeUser(updatedUser));
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);

    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning({ id: users.id });

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(204).send();
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
