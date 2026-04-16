// ============================================
// ENHANCED: Payment Routes with Additional Endpoints
// backend/routes/paymentRoutes.js
// ============================================
import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createPaymentOrder,
  verifyPayment,
  handlePaymentFailure,
  handleVerificationFailure,
  getPaymentStatus
} from '../controllers/paymentController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Payment routes
router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);
router.post('/failure', handlePaymentFailure);
router.post('/verification-failed', handleVerificationFailure);
router.get('/:orderId/status', getPaymentStatus);

export default router;