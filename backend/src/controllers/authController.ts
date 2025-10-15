import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';

import { db } from '../db';
import { users } from '../db/schema';
import type { AuthRequest, CreateUserRequest, LoginRequest } from '../types';
import { serializeUser } from '../utils/serializers';

const JWT_EXPIRES_IN = '24h';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body as LoginRequest;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, tenant: user.tenant },
      process.env.JWT_SECRET!,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: serializeUser(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const me = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    return res.json({ user: serializeUser(req.user) });
  } catch (error) {
    console.error('Me error:', error);
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

    return res.status(201).json({
      message: 'User created successfully',
      user: serializeUser(newUser),
    });
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
