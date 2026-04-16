// ============================================
// backend/routes/webhookRoutes.js
// ============================================
// routes/webhookRoutes.js
import express from 'express';
import {
  shiprocketWebhook,
  razorpayWebhook
} from '../controllers/webhookController.js';

const router = express.Router();

// No auth required for webhooks
router.post('/shiprocket', shiprocketWebhook);
router.post('/razorpay', razorpayWebhook);

export default router;