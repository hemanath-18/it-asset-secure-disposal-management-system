import express from 'express';
import { login, register, getMe } from '../controllers/auth.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', protect, authorize('ADMIN'), register);
router.get('/me', protect, getMe);

export default router;
