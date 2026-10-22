import express from 'express';
import {
  getAssetDisposalReport,
  getDataWipingReport,
  getComplianceReport
} from '../controllers/reports.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.get('/disposal', authorize('ADMIN', 'MANAGER'), getAssetDisposalReport);
router.get('/wiping', authorize('ADMIN', 'MANAGER'), getDataWipingReport);
router.get('/compliance', authorize('ADMIN', 'MANAGER'), getComplianceReport);

export default router;
