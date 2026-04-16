// 2. ADMIN RESELLER ROUTES
// routes/adminResellerRoutes.js
import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getResellerApplications,
  reviewResellerApplication,
  getAllResellers,
  getResellerDetails,
  freezeWallet,
  unfreezeWallet,
  adjustWalletBalance,
  getWithdrawalRequests,
  processWithdrawal
} from '../controllers/adminResellerController.js';

const router = express.Router();

router.use(protect, authorize('admin'));

// Applications
router.get('/applications', getResellerApplications);
router.put('/applications/:userId/review', reviewResellerApplication);

// Reseller Management
router.get('/resellers', getAllResellers);
router.get('/resellers/:userId', getResellerDetails);

// Wallet Management
router.post('/wallet/:userId/freeze', freezeWallet);
router.post('/wallet/:userId/unfreeze', unfreezeWallet);
router.post('/wallet/:userId/adjust', adjustWalletBalance);

// Withdrawals
router.get('/withdrawals', getWithdrawalRequests);
router.put('/withdrawals/:withdrawalId/process', processWithdrawal);

export default router;
