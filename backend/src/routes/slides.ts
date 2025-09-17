import { Router } from 'express';
import {
  getAllSlides,
  getSlideById,
  createSlide,
  updateSlide,
  deleteSlide,
  reorderSlides
} from '../controllers/slidesController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Public routes (for TV display)
router.get('/', getAllSlides);
router.get('/:id', getSlideById);

// Admin only routes
router.post('/', authenticateToken, requireAdmin, createSlide);
router.put('/:id', authenticateToken, requireAdmin, updateSlide);
router.delete('/:id', authenticateToken, requireAdmin, deleteSlide);
router.post('/reorder', authenticateToken, requireAdmin, reorderSlides);

export default router;
