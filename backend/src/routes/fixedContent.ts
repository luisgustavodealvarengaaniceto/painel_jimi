import { Router } from 'express';
import {
  getAllFixedContent,
  getFixedContentById,
  createFixedContent,
  updateFixedContent,
  deleteFixedContent
} from '../controllers/fixedContentController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Public routes (for TV display)
router.get('/', getAllFixedContent);
router.get('/:id', getFixedContentById);

// Admin only routes
router.post('/', authenticateToken, requireAdmin, createFixedContent);
router.put('/:id', authenticateToken, requireAdmin, updateFixedContent);
router.delete('/:id', authenticateToken, requireAdmin, deleteFixedContent);

export default router;
