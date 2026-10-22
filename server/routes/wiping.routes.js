import express from 'express';
import {
  getWipingRecords,
  getWipingRecordById,
  initiateWiping,
  updateWipingStatus,
  verifyWiping
} from '../controllers/wiping.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getWipingRecords);
router.get('/:id', getWipingRecordById);
router.post('/initiate', authorize('ADMIN', 'IT_STAFF'), initiateWiping);
router.put('/:id/status', authorize('ADMIN', 'IT_STAFF'), updateWipingStatus);
router.put('/:id/verify', authorize('ADMIN', 'MANAGER'), verifyWiping);

export default router;
