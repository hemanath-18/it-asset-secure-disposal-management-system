import express from 'express';
import {
  getDisposalRecords,
  getDisposalRecordById,
  createDisposalRequest,
  approveDisposal,
  executeDisposalMethod,
  completeDisposal
} from '../controllers/disposal.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getDisposalRecords);
router.get('/:id', getDisposalRecordById);
router.post('/request', authorize('ADMIN', 'IT_STAFF'), createDisposalRequest);
router.put('/:id/approve', authorize('ADMIN', 'MANAGER'), approveDisposal);
router.put('/:id/execute', authorize('ADMIN', 'IT_STAFF'), executeDisposalMethod);
router.put('/:id/complete', authorize('ADMIN', 'MANAGER'), completeDisposal);

export default router;
