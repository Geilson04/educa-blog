import { Router } from 'express';
import { register, login } from '../controllers/auth.controller.js';

const router = Router();

// Registration and login routes. Both routes accept JSON bodies
// validated in the controller.
router.post('/register', register);
router.post('/login', login);

export default router;