import { Router } from 'express';
import {
  uploadSlideAttachment,
  getSlideAttachments,
  deleteSlideAttachment,
  getArchivedSlides,
} from '../controllers/slideAttachmentsController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Rotas de anexos (admin only)
router.post('/:slideId/attachments', authenticateToken, requireAdmin, upload.single('image'), uploadSlideAttachment);
router.get('/:slideId/attachments', authenticateToken, getSlideAttachments);
router.delete('/attachments/:id', authenticateToken, requireAdmin, deleteSlideAttachment);

// Rota para slides arquivados
router.get('/archived', authenticateToken, getArchivedSlides);

export default router;
