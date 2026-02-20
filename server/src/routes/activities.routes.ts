import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/role.js';
import {
  createActivity,
  listTeacherActivities,
  listStudentActivities,
  assignActivity,
  submitActivity,
} from '../controllers/activities.controller.js';

const router = Router();

// Create a new activity (teacher only)
router.post('/', authenticate, requireRole(['DOCENTE']), createActivity);

// List activities created by the authenticated teacher
router.get('/mine', authenticate, requireRole(['DOCENTE']), listTeacherActivities);

// List activities assigned to the authenticated student
router.get('/student', authenticate, requireRole(['ALUNO']), listStudentActivities);

// Assign an activity to students (teacher only)
router.post('/:id/assign', authenticate, requireRole(['DOCENTE']), assignActivity);

// Submit an activity assignment (student only)
router.post('/assignment/:assignmentId/submit', authenticate, requireRole(['ALUNO']), submitActivity);

export default router;