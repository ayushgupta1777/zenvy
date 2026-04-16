import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner
} from '../controllers/bannerController.js';

const router = express.Router();

router.get('/', getBanners);
router.get('/all', protect, authorize('admin'), getAllBanners);
router.post('/', protect, authorize('admin'), createBanner);
router.put('/:id', protect, authorize('admin'), updateBanner);
router.delete('/:id', protect, authorize('admin'), deleteBanner);

export default router;