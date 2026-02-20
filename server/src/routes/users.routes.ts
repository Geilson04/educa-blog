import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/role.js';
import { getProfile, listStudents } from '../controllers/users.controller.js';

const router = Router();

// Protected route to get current user's profile
router.get('/me', authenticate, getProfile);

// Only teachers can list students for assignment
router.get('/students', authenticate, requireRole(['DOCENTE']), listStudents);

export default router;