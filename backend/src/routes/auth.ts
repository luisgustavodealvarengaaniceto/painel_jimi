import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, me, createUser } from '../controllers/authController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

const LOGIN_RATE_LIMIT_WINDOW_MS = Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000);
const LOGIN_RATE_LIMIT_MAX = Number(process.env.LOGIN_RATE_LIMIT_MAX ?? 10);

const loginLimiter = rateLimit({
	windowMs: LOGIN_RATE_LIMIT_WINDOW_MS,
	max: LOGIN_RATE_LIMIT_MAX,
	standardHeaders: true,
	legacyHeaders: false,
	message: 'Too many login attempts, please try again later.'
});

// Public routes
router.post('/login', loginLimiter, login);

// Protected routes
router.get('/me', authenticateToken, me);
router.post('/users', authenticateToken, requireAdmin, createUser);

export default router;
