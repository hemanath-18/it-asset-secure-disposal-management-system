import express from 'express';
import { getAuditLogs } from '../controllers/audit.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getAuditLogs);

export default router;
