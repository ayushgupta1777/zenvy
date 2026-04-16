import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import { AppError } from '../middleware/errorHandler.js';
import Order from '../models/Order.js';
import WalletTransaction from '../models/WalletTransaction.js';
import Withdrawal from '../models/Withdrawal.js';

/**
 * @desc    Apply as reseller - AUTO-APPROVED INSTANTLY
 * @route   POST /api/reseller/apply
 * @access  Private
 */
export const applyAsReseller = async (req, res, next) => {
  try {
    const { businessName, accountHolderName, accountNumber, bankName, ifscCode } = req.body;

    if (!businessName || !accountHolderName || !accountNumber || !bankName || !ifscCode) {
      return next(new AppError('All fields required', 400));
    }

    const user = await User.findById(req.user.id);

    // ✅ AUTO-APPROVE INSTANTLY
    user.resellerApplication = {
      status: 'approved',
      appliedAt: new Date(),
      approvedAt: new Date(),
      businessName,
      accountHolderName,
      accountNumber,
      bankName,
      ifscCode
    };

    await user.save();

    let wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) {
      wallet = await Wallet.create({
        user: req.user.id,
        balance: 0,
        pendingBalance: 0,
        totalEarned: 0
      });
    }

    res.json({
      success: true,
      message: 'You are now a reseller! 🎉',
      data: { user, wallet }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get wallet balance and stats
 * @route   GET /api/reseller/wallet
 * @access  Private (Reseller)
 */
export const getWallet = async (req, res, next) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user.id });

    if (!wallet) {
      // Create wallet if it doesn't exist
      wallet = await Wallet.create({
        user: req.user.id,
        balance: 0,
        pendingBalance: 0,
        totalEarned: 0,
        totalWithdrawn: 0
      });
    }

    // Calculate additional stats
    const totalSales = await Order.countDocuments({
      reseller: req.user.id,
      orderStatus: { $nin: ['cancelled', 'returned'] }
    });

    const pendingOrders = await Order.countDocuments({
      reseller: req.user.id,
      orderStatus: { $in: ['pending', 'confirmed', 'processing', 'shipped'] }
    });

    res.json({
      success: true,
      data: {
        availableBalance: wallet.balance,
        pendingBalance: wallet.pendingBalance,
        totalEarned: wallet.totalEarned,
        totalWithdrawn: wallet.totalWithdrawn,
        totalSales,
        pendingOrders,
        lockPeriodDays: 7
      }
    });
  } catch (error) {
    next(error);
  }
};


/**
 * @desc    Request withdrawal
 * @route   POST /api/reseller/withdrawal
 * @access  Private (Reseller)
 */
export const requestWithdrawal = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (amount < 100) {
      return next(new AppError('Minimum ₹100', 400));
    }

    const wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) return next(new AppError('Create wallet first', 404));

    if (wallet.balance < amount) {
      return next(new AppError('Insufficient balance', 400));
    }

    // Deduct from available balance immediately
    wallet.balance -= amount;
    await wallet.save();

    // Create withdrawal record for admin processing
    const withdrawal = await Withdrawal.create({
      user: req.user.id,
      wallet: wallet._id,
      amount,
      status: 'pending'
    });

    // Create a transaction record so the user can see in their history why money was deducted
    await WalletTransaction.create({
      wallet: wallet._id,
      user: req.user.id,
      type: 'debit',
      source: 'withdrawal',
      amount,
      balanceAfter: wallet.balance,
      description: `Withdrawal Request (Pending Admin Approval)`,
      referenceId: withdrawal._id,
      referenceModel: 'Withdrawal',
      status: 'pending'
    });

    res.json({
      success: true,
      message: 'Withdrawal request submitted successfully! Your balance has been updated.',
      data: { wallet, withdrawal }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get withdrawal requests
 * @route   GET /api/reseller/withdrawals
 * @access  Private (Reseller)
 */
export const getWithdrawals = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { user: req.user.id };

    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const withdrawals = await Withdrawal.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Withdrawal.countDocuments(query);

    res.json({
      success: true,
      data: {
        withdrawals,
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
};

/**
 * @desc    Get reseller sales/orders
 * @route   GET /api/reseller/sales
 * @access  Private (Reseller)
 */
export const getSales = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    // ✅ FIX: Query strictly for the logged-in reseller
    const query = {
      reseller: req.user.id,
      resellerEarning: { $gt: 0 }
    };

    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.product', 'title images price')
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
};

/**
 * @desc    Get reseller transactions (using WalletTransaction model)
 * @route   GET /api/reseller/transactions
 * @access  Private (Reseller)
 */
export const getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type } = req.query;

    const wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) {
      return res.json({
        success: true,
        data: {
          transactions: [],
          pagination: { page: 1, limit: 20, total: 0, pages: 0 }
        }
      });
    }

    const query = { wallet: wallet._id };

    if (type && type !== 'all') {
      if (type === 'commission') {
        query.source = 'resell_earning';
      } else if (type === 'withdrawal') {
        query.source = 'withdrawal';
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const transactions = await WalletTransaction.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await WalletTransaction.countDocuments(query);

    res.json({
      success: true,
      data: {
        transactions,
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
};

/**
 * @desc    Get reseller dashboard stats
 * @route   GET /api/reseller/stats
 * @access  Private (Reseller)
 */
export const getResellerStats = async (req, res, next) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user.id });

    // ✅ FIX: query strictly for logged in reseller
    const totalSales = await Order.countDocuments({
      reseller: req.user.id,
      resellerEarning: { $gt: 0 },
      orderStatus: { $nin: ['cancelled', 'returned'] }
    });

    const pendingOrders = await Order.countDocuments({
      reseller: req.user.id,
      resellerEarning: { $gt: 0 },
      orderStatus: { $in: ['pending', 'confirmed', 'processing'] }
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthSales = await Order.countDocuments({
      reseller: req.user.id,
      resellerEarning: { $gt: 0 },
      createdAt: { $gte: startOfMonth }
    });

    res.json({
      success: true,
      data: {
        totalSales,
        pendingOrders,
        monthSales,
        conversionRate: 0,
        totalEarned: wallet?.totalEarned || 0,
        availableBalance: wallet?.balance || 0,
        pendingBalance: wallet?.pendingBalance || 0,
        lockPeriodDays: 7
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate share link for product
 * @route   POST /api/reseller/share-link
 * @access  Private (Reseller)
 */
export const generateShareLink = async (req, res, next) => {
  try {
    const { productId, margin } = req.body;

    if (!productId || !margin) {
      return next(new AppError('Product ID and margin are required', 400));
    }

    if (margin < 5 || margin > 30) {
      return next(new AppError('Margin must be between 5% and 30%', 400));
    }

    const referralCode = `${req.user.id.toString().slice(-6).toUpperCase()}-${productId.slice(-4)}`;
    const baseUrl = process.env.FRONTEND_URL || 'https://yourapp.com';
    const shareLink = `${baseUrl}/product/${productId}?ref=${referralCode}&margin=${margin}`;

    const shareMessage = `
🛍️ Check out this amazing product!

💰 Special Offer Available
🚚 Free Delivery
✅ 100% Genuine Products

Shop now: ${shareLink}

Use code: ${referralCode} for exclusive deals!
    `.trim();

    res.json({
      success: true,
      data: {
        referralCode,
        margin,
        links: {
          webLink: shareLink,
          whatsappLink: `https://wa.me/?text=${encodeURIComponent(shareMessage)}`
        },
        shareMessage
      }
    });
  } catch (error) {
    next(error);
  }
};

export default {
  applyAsReseller,
  getWallet,
  requestWithdrawal,
  getWithdrawals,
  getSales,
  getTransactions,
  getResellerStats,
  generateShareLink
};