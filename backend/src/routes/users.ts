import { Router } from 'express';
import { 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  getUserById 
} from '../controllers/usersController';
import { authenticateToken as authMiddleware, requireAdmin as adminMiddleware } from '../middleware/auth';

const router = Router();

// Todas as rotas precisam de autenticação
router.use(authMiddleware);

// Apenas admins podem gerenciar usuários
router.get('/', adminMiddleware, getAllUsers);
router.post('/', adminMiddleware, createUser);
router.get('/:id', adminMiddleware, getUserById);
router.put('/:id', adminMiddleware, updateUser);
router.delete('/:id', adminMiddleware, deleteUser);

export default router;
