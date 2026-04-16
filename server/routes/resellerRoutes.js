import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  applyAsReseller,
  getWallet,
  requestWithdrawal,
  getWithdrawals,
  getSales,
  getTransactions,
  getResellerStats,
  generateShareLink
} from '../controllers/resellerController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Application
router.post('/apply', applyAsReseller);

// Wallet & Stats
router.get('/wallet', getWallet);
router.get('/stats', getResellerStats);

// Sharing
router.post('/share-link', generateShareLink);

// History & Data
router.get('/transactions', getTransactions);
router.get('/sales', getSales);
router.get('/withdrawals', getWithdrawals);

// Withdrawal - OLD endpoint that frontend expects
router.post('/withdrawal', requestWithdrawal);

export default router;