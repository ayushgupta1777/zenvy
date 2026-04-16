// 5. RETURN ROUTES
// routes/returnRoutes.js
import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  initiateReturn,
  getMyReturns,
  getReturnDetails,
  cancelReturn,
  getReturnRequests,
  reviewReturnRequest,
  scheduleReturnPickup,
  updateReturnStatus,
  processRefund
} from '../controllers/returnController.js';

const router = express.Router();

// Customer routes
router.use(protect);
router.post('/', initiateReturn);
router.get('/', getMyReturns);
router.get('/:returnId', getReturnDetails);
router.put('/:returnId/cancel', cancelReturn);

// Admin routes
router.get('/admin/requests', authorize('admin'), getReturnRequests);
router.put('/admin/:returnId/review', authorize('admin'), reviewReturnRequest);
router.post('/admin/:returnId/schedule-pickup', authorize('admin'), scheduleReturnPickup);
router.put('/admin/:returnId/status', authorize('admin'), updateReturnStatus);
router.post('/admin/:returnId/refund', authorize('admin'), processRefund);

export default router;