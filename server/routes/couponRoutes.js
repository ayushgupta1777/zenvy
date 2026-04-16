import express from 'express';
import {
    createCoupon,
    getAllCoupons,
    updateCoupon,
    deleteCoupon,
    validateCoupon
} from '../controllers/couponController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public/User routes
router.use(protect);
router.post('/validate', validateCoupon);

// Admin only routes
router.use(authorize('admin'));
router.route('/')
    .get(getAllCoupons)
    .post(createCoupon);

router.route('/:id')
    .put(updateCoupon)
    .delete(deleteCoupon);

export default router;
