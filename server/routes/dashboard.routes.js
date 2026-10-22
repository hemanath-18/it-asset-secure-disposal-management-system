import express from 'express';
import { getDashboardStats, getDashboardCharts } from '../controllers/dashboard.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.get('/stats', getDashboardStats);
router.get('/charts', getDashboardCharts);

export default router;
