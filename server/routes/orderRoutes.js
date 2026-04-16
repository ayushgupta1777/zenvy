import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createOrder,
  getMyOrders,
  getOrder,
  updatePaymentStatus,
  cancelOrder,
  updateOrderStatus,
  getOrderTracking
} from '../controllers/orderController.js';

const router = express.Router();

router.use(protect);

router.post('/checkout', createOrder);
router.get('/', getMyOrders);
router.get('/:orderId', getOrder);
router.put('/:orderId/payment', updatePaymentStatus);
router.put('/:orderId/cancel', cancelOrder); // ✅ ADD THIS
router.put('/:orderId/status', updateOrderStatus); // ✅ ADD THIS
router.get('/:orderId/tracking', getOrderTracking); // ✅ ADD THIS

export default router;