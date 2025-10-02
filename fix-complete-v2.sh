#!/bin/bash
# Script de correção completa para o servidor

echo "🚀 Iniciando correção completa..."

# Parar containers
docker-compose down

# Limpeza completa
rm -rf backend/prisma
rm -rf backend/node_modules
rm -rf node_modules
rm -f backend/package-lock.json
rm -f package-lock.json
rm -rf backend/src/controllers
mkdir -p backend/src/controllers

echo "📝 Criando authController..."
cat > backend/src/controllers/authController.ts << 'EOF'
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const userResult = await db.select().from(users).where(eq(users.username, username)).limit(1);
    const user = userResult[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const me = async (req: any, res: Response) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const existingUserResult = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (existingUserResult[0]) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserResult = await db.insert(users).values({
      username,
      password: hashedPassword,
      role: role || 'VIEWER'
    }).returning({
      id: users.id,
      username: users.username,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    });

    res.status(201).json({
      message: 'User created successfully',
      user: newUserResult[0]
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
EOF

echo "📝 Criando slidesController..."
cat > backend/src/controllers/slidesController.ts << 'EOF'
import { Response } from 'express';
import { db } from '../db';
import { slides } from '../db/schema';
import { eq } from 'drizzle-orm';

export const getAllSlides = async (req: any, res: Response) => {
  try {
    const slidesList = await db.select().from(slides)
      .where(eq(slides.isActive, true))
      .orderBy(slides.order);

    res.json({ slides: slidesList });
  } catch (error) {
    console.error('Get slides error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSlideById = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const slideResult = await db.select().from(slides)
      .where(eq(slides.id, parseInt(id)))
      .limit(1);

    const slide = slideResult[0];

    if (!slide) {
      return res.status(404).json({ message: 'Slide not found' });
    }

    res.json({ slide });
  } catch (error) {
    console.error('Get slide error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createSlide = async (req: any, res: Response) => {
  try {
    const { title, content, duration, order } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const newSlideResult = await db.insert(slides).values({
      title,
      content,
      duration: duration || 5000,
      order: order || 0,
      isActive: true
    }).returning();

    res.status(201).json({
      message: 'Slide created successfully',
      slide: newSlideResult[0]
    });
  } catch (error) {
    console.error('Create slide error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateSlide = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, duration, order, isActive } = req.body;

    const updatedSlideResult = await db.update(slides)
      .set({
        title,
        content,
        duration,
        order,
        isActive,
        updatedAt: new Date()
      })
      .where(eq(slides.id, parseInt(id)))
      .returning();

    res.json({
      message: 'Slide updated successfully',
      slide: updatedSlideResult[0]
    });
  } catch (error) {
    console.error('Update slide error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteSlide = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    await db.delete(slides).where(eq(slides.id, parseInt(id)));
    res.json({ message: 'Slide deleted successfully' });
  } catch (error) {
    console.error('Delete slide error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const reorderSlides = async (req: any, res: Response) => {
  try {
    const { slideOrders } = req.body;

    if (!slideOrders || !Array.isArray(slideOrders)) {
      return res.status(400).json({ message: 'Slide orders array is required' });
    }

    const updatePromises = slideOrders.map(({ id, order }: any) =>
      db.update(slides)
        .set({ order, updatedAt: new Date() })
        .where(eq(slides.id, id))
    );

    await Promise.all(updatePromises);

    res.json({ message: 'Slides reordered successfully' });
  } catch (error) {
    console.error('Reorder slides error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
EOF

echo "📝 Criando fixedContentController..."
cat > backend/src/controllers/fixedContentController.ts << 'EOF'
import { Response } from 'express';
import { db } from '../db';
import { fixedContent } from '../db/schema';
import { eq } from 'drizzle-orm';

export const getAllFixedContent = async (req: any, res: Response) => {
  try {
    const content = await db.select().from(fixedContent)
      .where(eq(fixedContent.isActive, true))
      .orderBy(fixedContent.order);

    res.json({ fixedContent: content });
  } catch (error) {
    console.error('Get fixed content error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getFixedContentById = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const contentResult = await db.select().from(fixedContent)
      .where(eq(fixedContent.id, parseInt(id)))
      .limit(1);

    const content = contentResult[0];

    if (!content) {
      return res.status(404).json({ message: 'Fixed content not found' });
    }

    res.json({ fixedContent: content });
  } catch (error) {
    console.error('Get fixed content error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createFixedContent = async (req: any, res: Response) => {
  try {
    const { type, content, order } = req.body;

    if (!type || !content) {
      return res.status(400).json({ message: 'Type and content are required' });
    }

    const newContentResult = await db.insert(fixedContent).values({
      type,
      content,
      order: order || 0,
      isActive: true
    }).returning();

    res.status(201).json({
      message: 'Fixed content created successfully',
      fixedContent: newContentResult[0]
    });
  } catch (error) {
    console.error('Create fixed content error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateFixedContent = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { type, content, order, isActive } = req.body;

    const updatedContentResult = await db.update(fixedContent)
      .set({
        type,
        content,
        order,
        isActive,
        updatedAt: new Date()
      })
      .where(eq(fixedContent.id, parseInt(id)))
      .returning();

    res.json({
      message: 'Fixed content updated successfully',
      fixedContent: updatedContentResult[0]
    });
  } catch (error) {
    console.error('Update fixed content error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteFixedContent = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    await db.delete(fixedContent).where(eq(fixedContent.id, parseInt(id)));
    res.json({ message: 'Fixed content deleted successfully' });
  } catch (error) {
    console.error('Delete fixed content error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
EOF

echo "📝 Criando usersController..."
cat > backend/src/controllers/usersController.ts << 'EOF'
import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export const getAllUsers = async (req: any, res: Response) => {
  try {
    const usersList = await db.select({
      id: users.id,
      username: users.username,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    }).from(users);

    res.json({ users: usersList });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserById = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userResult = await db.select({
      id: users.id,
      username: users.username,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    }).from(users).where(eq(users.id, parseInt(id))).limit(1);

    const user = userResult[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createUser = async (req: any, res: Response) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const existingUserResult = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (existingUserResult[0]) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserResult = await db.insert(users).values({
      username,
      password: hashedPassword,
      role: role || 'VIEWER'
    }).returning({
      id: users.id,
      username: users.username,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    });

    res.status(201).json({
      message: 'User created successfully',
      user: newUserResult[0]
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUser = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { username, password, role } = req.body;

    const updateData: any = { username, role, updatedAt: new Date() };
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUserResult = await db.update(users)
      .set(updateData)
      .where(eq(users.id, parseInt(id)))
      .returning({
        id: users.id,
        username: users.username,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      });

    res.json({
      message: 'User updated successfully',
      user: updatedUserResult[0]
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteUser = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    await db.delete(users).where(eq(users.id, parseInt(id)));
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
EOF

echo "📝 Atualizando middleware de auth..."
cat > backend/src/middleware/auth.ts << 'EOF'
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export const authenticateToken = async (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.get('authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    const userResult = await db.select({
      id: users.id,
      username: users.username,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    }).from(users).where(eq(users.id, decoded.userId)).limit(1);

    const user = userResult[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const requireAdmin = (req: any, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
EOF

echo "🔄 Rebuild completo..."
docker-compose up --build -d

echo "✅ Correção concluída!"
echo "🌐 Teste: curl http://localhost:1212/api/health"