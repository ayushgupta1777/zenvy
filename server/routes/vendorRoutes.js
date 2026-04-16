// ============================================
// backend/routes/vendorRoutes.js
// ============================================
import express from 'express';
import Vendor from '../models/Vendor.js';
import Order from '../models/Order.js';
import { protect, authorize } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * @desc    Get vendor dashboard
 * @route   GET /api/vendor/dashboard
 * @access  Private (Vendor)
 */
router.get('/dashboard', protect, authorize('vendor'), async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return next(new AppError('Vendor profile not found', 404));
    }

    // Get order statistics
    const orders = await Order.find({ vendor: vendor._id });
    const pendingOrders = orders.filter(o => o.orderStatus === 'pending').length;
    const completedOrders = orders.filter(o => o.orderStatus === 'delivered').length;
    const totalRevenue = orders
      .filter(o => o.orderStatus === 'delivered')
      .reduce((sum, o) => sum + o.total, 0);

    res.json({
      success: true,
      data: {
        vendor,
        stats: {
          totalProducts: vendor.totalProducts,
          totalOrders: orders.length,
          pendingOrders,
          completedOrders,
          totalRevenue
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Get vendor orders
 * @route   GET /api/vendor/orders
 * @access  Private (Vendor)
 */
router.get('/orders', protect, authorize('vendor'), async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return next(new AppError('Vendor profile not found', 404));
    }

    const { status, page = 1, limit = 10 } = req.query;
    const query = { vendor: vendor._id };
    
    if (status) {
      query.orderStatus = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.product', 'title images')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Update vendor profile
 * @route   PUT /api/vendor/profile
 * @access  Private (Vendor)
 */
router.put('/profile', protect, authorize('vendor'), async (req, res, next) => {
  try {
    const { storeName, storeDescription, gstNumber, panNumber, bankDetails, businessAddress } = req.body;

    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return next(new AppError('Vendor profile not found', 404));
    }

    if (storeName) vendor.storeName = storeName;
    if (storeDescription) vendor.storeDescription = storeDescription;
    if (gstNumber) vendor.gstNumber = gstNumber;
    if (panNumber) vendor.panNumber = panNumber;
    if (bankDetails) vendor.bankDetails = bankDetails;
    if (businessAddress) vendor.businessAddress = businessAddress;

    await vendor.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { vendor }
    });
  } catch (error) {
    next(error);
  }
});

export default router;