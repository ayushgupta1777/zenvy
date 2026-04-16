// ============================================
// controllers/adminResellerController.js
// Admin Management for Resellers
// ============================================
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import WalletTransaction from '../models/WalletTransaction.js';
import Withdrawal from '../models/Withdrawal.js';
import Order from '../models/Order.js';
import { AppError } from '../middleware/errorHandler.js';
import notificationService from '../services/notificationService.js';

/**
 * @desc    Get all reseller applications
 * @route   GET /api/admin/reseller/applications
 * @access  Private (Admin)
 */
export const getResellerApplications = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {
      'resellerApplication.status': { $ne: 'none' }
    };

    if (status && status !== 'all') {
      query['resellerApplication.status'] = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const applications = await User.find(query)
      .select('name email phone resellerApplication createdAt')
      .sort('-resellerApplication.appliedAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        applications,
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
 * @desc    Review reseller application
 * @route   PUT /api/admin/reseller/applications/:userId/review
 * @access  Private (Admin)
 */
export const reviewResellerApplication = async (req, res, next) => {
  try {
    const { action, rejectionReason } = req.body; // action: 'approve' or 'reject'
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.resellerApplication.status !== 'pending') {
      return next(new AppError('Application has already been reviewed', 400));
    }

    if (action === 'approve') {
      user.resellerApplication.status = 'approved';
      user.role = 'reseller';
      user.resellerApplication.reviewedAt = new Date();

      // Create wallet for reseller
      const existingWallet = await Wallet.findOne({ user: userId });
      if (!existingWallet) {
        await Wallet.create({
          user: userId,
          balance: 0,
          pendingBalance: 0,
          totalEarned: 0,
          totalWithdrawn: 0
        });
      }

      // Send approval notification
      await notificationService.sendNotification({
        user: userId,
        type: 'reseller_approved',
        title: 'Reseller Application Approved! 🎉',
        message: 'Congratulations! Your reseller application has been approved. Start earning now!',
        data: {
          userName: user.name
        }
      });

      console.log(`✅ Reseller application approved for user: ${user.email}`);
    } else if (action === 'reject') {
      user.resellerApplication.status = 'rejected';
      user.resellerApplication.rejectionReason = rejectionReason;
      user.resellerApplication.reviewedAt = new Date();

      // Send rejection notification
      await notificationService.sendNotification({
        user: userId,
        type: 'reseller_rejected',
        title: 'Reseller Application Update',
        message: `Your reseller application has been reviewed. Reason: ${rejectionReason}`,
        data: {
          userName: user.name,
          reason: rejectionReason
        }
      });

      console.log(`❌ Reseller application rejected for user: ${user.email}`);
    } else {
      return next(new AppError('Invalid action', 400));
    }

    await user.save();

    res.json({
      success: true,
      message: `Application ${action}d successfully`,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all resellers
 * @route   GET /api/admin/reseller/resellers
 * @access  Private (Admin)
 */
export const getAllResellers = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;

    const query = {
      'resellerApplication.status': 'approved'
    };

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const resellers = await User.find(query)
      .select('name email phone resellerApplication createdAt')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    // Get wallet and stats for each reseller
    const resellersWithStats = await Promise.all(
      resellers.map(async (reseller) => {
        const wallet = await Wallet.findOne({ user: reseller._id });
        const totalOrders = await Order.countDocuments({
          reseller: reseller._id,
          orderStatus: 'delivered'
        });
        const totalEarnings = await Order.aggregate([
          { $match: { reseller: reseller._id, orderStatus: 'delivered' } },
          { $group: { _id: null, total: { $sum: '$totalResellerEarning' } } }
        ]);

        return {
          ...reseller.toObject(),
          wallet: {
            balance: wallet?.balance || 0,
            totalEarned: wallet?.totalEarned || 0,
            totalWithdrawn: wallet?.totalWithdrawn || 0
          },
          stats: {
            totalOrders,
            totalEarnings: totalEarnings[0]?.total || 0
          }
        };
      })
    );

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        resellers: resellersWithStats,
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
 * @desc    Get reseller details
 * @route   GET /api/admin/reseller/resellers/:userId
 * @access  Private (Admin)
 */
export const getResellerDetails = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.resellerApplication.status !== 'approved') {
      return next(new AppError('User is not an approved reseller', 400));
    }

    // Get wallet
    const wallet = await Wallet.findOne({ user: userId });

    // Get orders
    const orders = await Order.find({ reseller: userId })
      .populate('user', 'name email')
      .populate('items.product', 'title images')
      .sort('-createdAt')
      .limit(10);

    // Get wallet transactions
    const transactions = await WalletTransaction.find({ user: userId })
      .sort('-createdAt')
      .limit(20);

    // Get withdrawal requests
    const withdrawals = await Withdrawal.find({ user: userId })
      .sort('-createdAt')
      .limit(10);

    // Calculate stats
    const stats = {
      totalOrders: await Order.countDocuments({ reseller: userId }),
      deliveredOrders: await Order.countDocuments({ reseller: userId, orderStatus: 'delivered' }),
      totalEarnings: wallet?.totalEarned || 0,
      pendingEarnings: await Order.aggregate([
        { $match: { reseller: userId, resellerEarningStatus: 'pending' } },
        { $group: { _id: null, total: { $sum: '$totalResellerEarning' } } }
      ]).then(result => result[0]?.total || 0),
      totalWithdrawn: wallet?.totalWithdrawn || 0
    };

    res.json({
      success: true,
      data: {
        user,
        wallet,
        orders,
        transactions,
        withdrawals,
        stats
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Freeze reseller wallet
 * @route   POST /api/admin/reseller/wallet/:userId/freeze
 * @access  Private (Admin)
 */
export const freezeWallet = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      return next(new AppError('Wallet not found', 404));
    }

    if (wallet.isFrozen) {
      return next(new AppError('Wallet is already frozen', 400));
    }

    wallet.isFrozen = true;
    wallet.freezeReason = reason;
    await wallet.save();

    // Send notification
    await notificationService.sendNotification({
      user: userId,
      type: 'wallet_frozen',
      title: 'Wallet Frozen',
      message: `Your wallet has been frozen. Reason: ${reason}. Contact support for details.`
    });

    res.json({
      success: true,
      message: 'Wallet frozen successfully',
      data: { wallet }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Unfreeze reseller wallet
 * @route   POST /api/admin/reseller/wallet/:userId/unfreeze
 * @access  Private (Admin)
 */
export const unfreezeWallet = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      return next(new AppError('Wallet not found', 404));
    }

    if (!wallet.isFrozen) {
      return next(new AppError('Wallet is not frozen', 400));
    }

    wallet.isFrozen = false;
    wallet.freezeReason = null;
    await wallet.save();

    // Send notification
    await notificationService.sendNotification({
      user: userId,
      type: 'wallet_unfrozen',
      title: 'Wallet Unfrozen',
      message: 'Your wallet has been unfrozen. You can now request withdrawals.'
    });

    res.json({
      success: true,
      message: 'Wallet unfrozen successfully',
      data: { wallet }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Adjust wallet balance (Admin)
 * @route   POST /api/admin/reseller/wallet/:userId/adjust
 * @access  Private (Admin)
 */
export const adjustWalletBalance = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { amount, type, description } = req.body; // type: 'credit' or 'debit'

    if (!amount || amount <= 0) {
      return next(new AppError('Invalid amount', 400));
    }

    if (!['credit', 'debit'].includes(type)) {
      return next(new AppError('Invalid type. Must be credit or debit', 400));
    }

    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      return next(new AppError('Wallet not found', 404));
    }

    // Adjust balance
    if (type === 'credit') {
      wallet.balance += amount;
    } else {
      if (wallet.balance < amount) {
        return next(new AppError('Insufficient balance', 400));
      }
      wallet.balance -= amount;
    }

    await wallet.save();

    // Create transaction record
    await WalletTransaction.create({
      wallet: wallet._id,
      user: userId,
      type,
      source: 'admin_adjustment',
      amount,
      balanceAfter: wallet.balance,
      description: description || `Admin adjustment by ${req.user.name}`,
      status: 'completed'
    });

    // Send notification
    await notificationService.sendNotification({
      user: userId,
      type: type === 'credit' ? 'wallet_credited' : 'wallet_debited',
      title: `Wallet ${type === 'credit' ? 'Credited' : 'Debited'}`,
      message: `₹${amount} has been ${type === 'credit' ? 'credited to' : 'debited from'} your wallet. ${description || ''}`,
      data: {
        amount,
        balance: wallet.balance
      }
    });

    res.json({
      success: true,
      message: `Wallet ${type}ed successfully`,
      data: { wallet }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all withdrawal requests
 * @route   GET /api/admin/reseller/withdrawals
 * @access  Private (Admin)
 */
export const getWithdrawalRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const withdrawals = await Withdrawal.find(query)
      .populate('user', 'name email phone')
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
 * @desc    Process withdrawal request
 * @route   PUT /api/admin/reseller/withdrawals/:withdrawalId/process
 * @access  Private (Admin)
 */
export const processWithdrawal = async (req, res, next) => {
  try {
    const { withdrawalId } = req.params;
    const { action, utrNumber, rejectionReason } = req.body; // action: 'complete' or 'reject'

    const withdrawal = await Withdrawal.findById(withdrawalId).populate('wallet');

    if (!withdrawal) {
      return next(new AppError('Withdrawal request not found', 404));
    }

    if (withdrawal.status !== 'pending') {
      return next(new AppError('Withdrawal already processed', 400));
    }

    if (action === 'complete') {
      if (!utrNumber) {
        return next(new AppError('UTR number is required', 400));
      }

      withdrawal.status = 'completed';
      withdrawal.utrNumber = utrNumber;
      withdrawal.completedAt = new Date();

      // Update wallet stats (balance was already deducted on request)
      const wallet = withdrawal.wallet;
      wallet.totalWithdrawn += withdrawal.amount;
      await wallet.save();

      // Update the existing transaction record from 'pending' to 'completed'
      await WalletTransaction.findOneAndUpdate(
        { referenceId: withdrawal._id, source: 'withdrawal' },
        { 
          status: 'completed',
          description: `Withdrawal to Bank (UTR: ${utrNumber})`
        }
      );

      // Send notification
      await notificationService.sendNotification({
        user: withdrawal.user,
        type: 'withdrawal_completed',
        title: 'Withdrawal Completed',
        message: `Your withdrawal of ₹${withdrawal.amount} has been processed. UTR: ${utrNumber}`,
        data: {
          amount: withdrawal.amount,
          utrNumber,
          userName: withdrawal.user.name
        }
      });

      console.log(`✅ Withdrawal ${withdrawal.withdrawalNo} completed`);
    } else if (action === 'reject') {
      withdrawal.status = 'rejected';
      withdrawal.rejectionReason = rejectionReason;

      // Return amount to available balance
      const wallet = withdrawal.wallet;
      wallet.balance += withdrawal.amount;
      await wallet.save();

      // Update the pending transaction to 'failed'
      await WalletTransaction.findOneAndUpdate(
        { referenceId: withdrawal._id, source: 'withdrawal' },
        { status: 'failed', description: `Withdrawal Rejected: ${rejectionReason}` }
      );

      // Create a NEW 'Credit' transaction for the refund record
      await WalletTransaction.create({
        wallet: wallet._id,
        user: withdrawal.user._id,
        type: 'credit',
        source: 'refund',
        amount: withdrawal.amount,
        balanceAfter: wallet.balance,
        description: `Refund: Withdrawal Rejected (${rejectionReason})`,
        referenceId: withdrawal._id,
        referenceModel: 'Withdrawal',
        status: 'completed'
      });

      // Send notification
      await notificationService.sendNotification({
        user: withdrawal.user,
        type: 'withdrawal_rejected',
        title: 'Withdrawal Rejected',
        message: `Your withdrawal request has been rejected. Reason: ${rejectionReason}. Amount has been returned to your wallet.`,
        data: {
          amount: withdrawal.amount,
          reason: rejectionReason
        }
      });

      console.log(`❌ Withdrawal ${withdrawal.withdrawalNo} rejected`);
    } else {
      return next(new AppError('Invalid action', 400));
    }

    withdrawal.processedBy = req.user.id;
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    res.json({
      success: true,
      message: `Withdrawal ${action}d successfully`,
      data: { withdrawal }
    });
  } catch (error) {
    next(error);
  }
};

