import express from 'express';
import {
  getRecyclingRecords,
  updateRecyclingRecord
} from '../controllers/recycling.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getRecyclingRecords);
router.put('/:id', authorize('ADMIN', 'IT_STAFF', 'MANAGER'), updateRecyclingRecord);

export default router;
