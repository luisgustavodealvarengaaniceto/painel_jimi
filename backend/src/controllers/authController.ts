import { Request, Response } from 'express';import { Request, Response } from 'express';import { Request, Response } from 'express';

import bcrypt from 'bcryptjs';

import jwt from 'jsonwebtoken';import bcrypt from 'bcryptjs';import bcrypt from 'bcryptjs';

import { db } from '../db';

import { users } from '../db/schema';import * as jwt from 'jsonwebtoken';import * as jwt from 'jsonwebtoken';

import { eq } from 'drizzle-orm';

import { db } from '../db';import { db } from '../db';

export const login = async (req: Request, res: Response) => {

  try {import { users } from '../db/schema';import { users } from '../db/schema';

    const { username, password } = req.body;

import { eq } from 'drizzle-orm';import { eq } from 'drizzle-orm';

    if (!username || !password) {

      return res.status(400).json({ message: 'Username and password are required' });import type { LoginRequest, AuthRequest } from '../types';import type { LoginRequest, AuthRequest } from '../types';

    }



    const userResult = await db.select().from(users).where(eq(users.username, username)).limit(1);

    const user = userResult[0];export const login = async (req: Request, res: Response) => {export const login = async (req: Request, res: Response) => {



    if (!user) {  try {  try {

      return res.status(401).json({ message: 'Invalid credentials' });

    }    const { username, password }: LoginRequest = req.body;    const { username, password }: LoginRequest = req.body;



    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {

      return res.status(401).json({ message: 'Invalid credentials' });    if (!username || !password) {    if (!username || !password) {

    }

      return res.status(400).json({ message: 'Username and password are required' });      return res.status(400).json({ message: 'Username and password are required' });

    const token = jwt.sign(

      { userId: user.id, username: user.username, role: user.role },    }    }

      process.env.JWT_SECRET!,

      { expiresIn: '24h' }

    );

    // Find user    // Find user

    res.json({

      message: 'Login successful',    const userResult = await db.select().from(users).where(eq(users.username, username)).limit(1);    const userResult = await db.select().from(users).where(eq(users.username, username)).limit(1);

      token,

      user: {    const user = userResult[0];    const user = userResult[0];

        id: user.id,

        username: user.username,

        role: user.role

      }    if (!user) {    if (!user) {

    });

  } catch (error) {      return res.status(401).json({ message: 'Invalid credentials' });      return res.status(401).json({ message: 'Invalid credentials' });

    console.error('Login error:', error);

    res.status(500).json({ message: 'Internal server error' });    }    }

  }

};



export const register = async (req: Request, res: Response) => {    // Check password    // Check password

  try {

    const { username, password, role } = req.body;    const isPasswordValid = await bcrypt.compare(password, user.password);    const isPasswordValid = await bcrypt.compare(password, user.password);



    if (!username || !password) {    if (!isPasswordValid) {    if (!isPasswordValid) {

      return res.status(400).json({ message: 'Username and password are required' });

    }      return res.status(401).json({ message: 'Invalid credentials' });      return res.status(401).json({ message: 'Invalid credentials' });



    const existingUserResult = await db.select().from(users).where(eq(users.username, username)).limit(1);    }    }

    if (existingUserResult[0]) {

      return res.status(400).json({ message: 'Username already exists' });

    }

    // Generate JWT token    // Generate JWT

    const hashedPassword = await bcrypt.hash(password, 10);

    const token = jwt.sign(    const jwtSecret = process.env.JWT_SECRET;

    const newUserResult = await db.insert(users).values({

      username,      { userId: user.id, username: user.username, role: user.role },    if (!jwtSecret) {

      password: hashedPassword,

      role: role || 'VIEWER'      process.env.JWT_SECRET!,      throw new Error('JWT_SECRET is not defined');

    }).returning({

      id: users.id,      { expiresIn: '24h' }    }

      username: users.username,

      role: users.role,    );

      createdAt: users.createdAt,

      updatedAt: users.updatedAt    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '7d' });

    });

    res.json({

    res.status(201).json({

      message: 'User created successfully',      message: 'Login successful',    res.json({

      user: newUserResult[0]

    });      token,      message: 'Login successful',

  } catch (error) {

    console.error('Create user error:', error);      user: {      token,

    res.status(500).json({ message: 'Internal server error' });

  }        id: user.id,      user: {

};
        username: user.username,        id: user.id,

        role: user.role        username: user.username,

      }        role: user.role

    });      }

  } catch (error) {    });

    console.error('Login error:', error);  } catch (error) {

    res.status(500).json({ message: 'Internal server error' });    console.error('Login error:', error);

  }    res.status(500).json({ message: 'Internal server error' });

};  }

};

export const register = async (req: AuthRequest, res: Response) => {

  try {export const me = async (req: AuthRequest, res: Response) => {

    const { username, password, role } = req.body;  try {

    if (!req.user) {

    if (!username || !password) {      return res.status(401).json({ message: 'Not authenticated' });

      return res.status(400).json({ message: 'Username and password are required' });    }

    }

    res.json({ user: req.user });

    // Check if user already exists  } catch (error) {

    const existingUserResult = await db.select().from(users).where(eq(users.username, username)).limit(1);    console.error('Me error:', error);

    const existingUser = existingUserResult[0];    res.status(500).json({ message: 'Internal server error' });

  }

    if (existingUser) {};

      return res.status(400).json({ message: 'Username already exists' });

    }export const createUser = async (req: AuthRequest, res: Response) => {

  try {

    // Hash password    const { username, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    if (!username || !password) {

    // Create user      return res.status(400).json({ message: 'Username and password are required' });

    const newUserResult = await db.insert(users).values({    }

      username,

      password: hashedPassword,    // Check if user already exists

      role: role || 'VIEWER'    const existingUserResult = await db.select().from(users).where(eq(users.username, username)).limit(1);

    }).returning({    const existingUser = existingUserResult[0];

      id: users.id,

      username: users.username,    if (existingUser) {

      role: users.role,      return res.status(400).json({ message: 'Username already exists' });

      createdAt: users.createdAt,    }

      updatedAt: users.updatedAt

    });    // Hash password

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = newUserResult[0];

    // Create user

    res.status(201).json({    const newUserResult = await db.insert(users).values({

      message: 'User created successfully',      username,

      user      password: hashedPassword,

    });      role: role || 'VIEWER'

  } catch (error) {    }).returning({

    console.error('Create user error:', error);      id: users.id,

    res.status(500).json({ message: 'Internal server error' });      username: users.username,

  }      role: users.role,

};      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    });

    const user = newUserResult[0];

    res.status(201).json({
      message: 'User created successfully',
      user
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
