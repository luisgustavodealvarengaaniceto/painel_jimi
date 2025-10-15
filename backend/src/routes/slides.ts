import { Router } from 'express';
import {
  getAllSlides,
  getSlideById,
  createSlide,
  updateSlide,
  deleteSlide,
  reorderSlides,
  getArchivedSlides
} from '../controllers/slidesController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// All routes now require authentication for tenant filtering
router.get('/', authenticateToken, getAllSlides);
router.get('/:id', authenticateToken, getSlideById);

// Admin only routes
router.post('/', authenticateToken, requireAdmin, createSlide);
router.put('/:id', authenticateToken, requireAdmin, updateSlide);
router.delete('/:id', authenticateToken, requireAdmin, deleteSlide);
router.post('/reorder', authenticateToken, requireAdmin, reorderSlides);
router.get('/archived/list', authenticateToken, requireAdmin, getArchivedSlides);

export default router;
