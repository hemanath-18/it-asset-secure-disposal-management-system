import express from 'express';
import {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  updateAssetStatus,
  deleteAsset
} from '../controllers/asset.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getAssets);
router.get('/:id', getAssetById);
router.post('/', authorize('ADMIN', 'IT_STAFF'), createAsset);
router.put('/:id', authorize('ADMIN', 'IT_STAFF'), updateAsset);
router.patch('/:id/status', authorize('ADMIN', 'IT_STAFF', 'MANAGER'), updateAssetStatus);
router.delete('/:id', authorize('ADMIN'), deleteAsset);

export default router;
