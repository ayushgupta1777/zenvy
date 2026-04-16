// ============================================
// backend/routes/index.js
// ============================================
import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import productRoutes from './productRoutes.js';
import cartRoutes from './cartRoutes.js';
import orderRoutes from './orderRoutes.js';
import resellerRoutes from './resellerRoutes.js';
import vendorRoutes from './vendorRoutes.js';
import adminRoutes from './adminRoutes.js';
import webhookRoutes from './webhookRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import bannerRoutes from './bannerRoutes.js';
import searchRoutes from './searchRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import shiprocketRoutes from './shiprocketRoutes.js';
import adminResellerRoutes from './adminResellerRoutes.js';
import adminProductRoutes from './adminProductRoutes.js';
import returnRoutes from './returnRoutes.js';
import wishlistRoutes from './wishlistRoutes.js';


const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/banners', bannerRoutes);
router.use('/search', searchRoutes);
router.use('/notifications', notificationRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/returns', returnRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/reseller', resellerRoutes);
router.use('/vendor', vendorRoutes);
router.use('/admin', adminRoutes);
router.use('/admin/resellers', adminResellerRoutes);
router.use('/admin/products', adminProductRoutes);
router.use('/shiprocket', shiprocketRoutes);
router.use('/webhooks', webhookRoutes);

export default router;