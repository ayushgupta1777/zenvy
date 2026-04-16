// ============================================
// backend/routes/cartRoutes.js
// ============================================
// 3. CART ROUTES (UPDATED)
// routes/cartRoutes.js
import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  updateResellPrice
} from '../controllers/cartController.js';

const router = express.Router();

router.use(protect);
router.get('/', getCart);
router.post('/items', addToCart);
router.put('/items/:itemId', updateCartItem);
router.put('/items/:itemId/resell-price', updateResellPrice);
router.delete('/items/:itemId', removeFromCart);
router.delete('/', clearCart);
router.delete('/clear', protect, clearCart);

export default router;