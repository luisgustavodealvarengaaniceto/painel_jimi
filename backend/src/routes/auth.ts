import { Router } from 'express';
import { login, me, createUser } from '../controllers/authController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/login', login);

// Protected routes
router.get('/me', authenticateToken, me);
router.post('/users', authenticateToken, requireAdmin, createUser);

export default router;
