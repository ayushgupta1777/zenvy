// backend/routes/adminRoutes.js
// ============================================
import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getAllOrders,
  getOrderStats,
  getOrderById,
  updateOrderStatus,
  cancelOrder
} from '../controllers/adminOrderController.js';

const router = express.Router();

// Protect all routes and require admin role
router.use(protect, authorize('admin'));

// Order routes
router.get('/orders', getAllOrders);
router.get('/orders/stats', getOrderStats);
router.get('/orders/:orderId', getOrderById);
router.put('/orders/:orderId/status', updateOrderStatus);
router.put('/orders/:orderId/cancel', cancelOrder);

export default router;