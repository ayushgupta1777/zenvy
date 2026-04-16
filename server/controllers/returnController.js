// ============================================
// controllers/returnController.js
// Complete Return Management System
// ============================================
import ReturnRequest from '../models/ReturnRequest.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Wallet from '../models/Wallet.js';
import WalletTransaction from '../models/WalletTransaction.js';
import { AppError } from '../middleware/errorHandler.js';
import shiprocketService from '../services/shiprocketService.js';
import notificationService from '../services/notificationService.js';

/**
 * Generate unique return number
 */
const generateReturnNumber = async () => {
  const prefix = 'RET';
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  
  const todayReturnCount = await ReturnRequest.countDocuments({
    createdAt: {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
      $lte: new Date(date.setHours(23, 59, 59, 999))
    }
  });
  
  const sequence = (todayReturnCount + 1).toString().padStart(4, '0');
  return `${prefix}${year}${month}${sequence}`;
};

/**
 * @desc    Initiate return request
 * @route   POST /api/returns
 * @access  Private
 */
// export const initiateReturn = async (req, res, next) => {
//   try {
//     const { orderId, items, returnReason, returnDescription, returnImages = [] } = req.body;

//     // Validate order
//     const order = await Order.findById(orderId);
    
//     if (!order) {
//       return next(new AppError('Order not found', 404));
//     }

//     if (order.user.toString() !== req.user.id) {
//       return next(new AppError('Not authorized', 403));
//     }

//     if (order.orderStatus !== 'delivered') {
//       return next(new AppError('Only delivered orders can be returned', 400));
//     }

//     // Check return window
//     const now = new Date();
//     if (order.returnWindowEndDate && now > order.returnWindowEndDate) {
//       return next(new AppError('Return window has expired', 400));
//     }

//     // Check if return already exists
//     const existingReturn = await ReturnRequest.findOne({
//       order: orderId,
//       status: { $nin: ['cancelled', 'rejected'] }
//     });

//     if (existingReturn) {
//       return next(new AppError('Return request already exists for this order', 400));
//     }

//     // Validate items
//     const returnItems = [];
//     let totalRefundAmount = 0;

//     for (const item of items) {
//       const orderItem = order.items.id(item.orderItemId);
      
//       if (!orderItem) {
//         return next(new AppError('Invalid order item', 400));
//       }

//       if (item.quantity > orderItem.quantity) {
//         return next(new AppError('Invalid quantity for return', 400));
//       }

//       returnItems.push({
//         orderItem: orderItem._id,
//         product: orderItem.product,
//         quantity: item.quantity,
//         reason: item.reason || returnReason,
//         images: item.images || []
//       });

//       // Calculate refund (based on final price customer paid)
//       totalRefundAmount += orderItem.finalPrice * item.quantity;
//     }

//     // Generate return number
//     const returnNo = await generateReturnNumber();

//     // Create return request
//     const returnRequest = await ReturnRequest.create({
//       returnNo,
//       order: orderId,
//       user: req.user.id,
//       items: returnItems,
//       returnReason,
//       returnDescription,
//       returnImages,
//       refundAmount: totalRefundAmount,
//       refundMethod: order.paymentMethod === 'cod' ? 'wallet' : 'original_payment',
//       status: 'pending'
//     });

//     // Send notification to user
//     await notificationService.sendNotification({
//       user: req.user.id,
//       type: 'return_initiated',
//       title: 'Return Request Submitted',
//       message: `Your return request ${returnNo} has been submitted and is under review.`,
//       referenceId: returnRequest._id.toString(),
//       referenceModel: 'ReturnRequest'
//     });

//     // Send notification to admin
//     const adminUsers = await User.find({ role: 'admin' });
//     for (const admin of adminUsers) {
//       await notificationService.sendNotification({
//         user: admin._id,
//         type: 'return_initiated',
//         title: 'New Return Request',
//         message: `Return request ${returnNo} needs review for order ${order.orderNo}`,
//         referenceId: returnRequest._id.toString(),
//         referenceModel: 'ReturnRequest'
//       });
//     }

//     res.status(201).json({
//       success: true,
//       message: 'Return request submitted successfully',
//       data: { returnRequest }
//     });
//   } catch (error) {
//     next(error);
//   }
// };
export const initiateReturn = async (req, res, next) => {
  try {
    const { orderId, items, returnReason, returnDescription } = req.body;

    const order = await Order.findById(orderId);
    
    if (order.orderStatus !== 'delivered') {
      return next(new AppError('Only delivered orders can be returned', 400));
    }

    // ✅ FIX: Check return window based on delivery date
    const now = new Date();
    if (!order.deliveredAt) {
      return next(new AppError('Delivery date not recorded', 400));
    }

    if (now > order.returnWindowEndDate) {
      const daysExpired = Math.ceil(
        (now - order.returnWindowEndDate) / (1000 * 60 * 60 * 24)
      );
      return next(new AppError(
        `Return window expired ${daysExpired} days ago`,
        400
      ));
    }

    // Calculate days remaining
    const daysRemaining = Math.ceil(
      (order.returnWindowEndDate - now) / (1000 * 60 * 60 * 24)
    );

    // Create return request
    const returnRequest = await ReturnRequest.create({
      returnNo: await generateReturnNumber(),
      order: orderId,
      user: req.user.id,
      items,
      returnReason,
      returnDescription,
      refundAmount: calculateRefundAmount(order, items),
      refundMethod: order.paymentMethod === 'cod' ? 'wallet' : 'original_payment'
    });

    // Update order status
    await order.updateStatus('return_initiated', {
      userId: req.user.id,
      reason: 'Customer initiated return'
    });

    res.status(201).json({
      success: true,
      message: `Return initiated. ${daysRemaining} days remaining in return window.`,
      data: { returnRequest }
    });
  } catch (error) {
    next(error);
  }
};
/**
 * @desc    Get user's return requests
 * @route   GET /api/returns
 * @access  Private
 */
export const getMyReturns = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { user: req.user.id };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const returns = await ReturnRequest.find(query)
      .populate('order', 'orderNo total')
      .populate('items.product', 'title images')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ReturnRequest.countDocuments(query);

    res.json({
      success: true,
      data: {
        returns,
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
 * @desc    Get return details
 * @route   GET /api/returns/:returnId
 * @access  Private
 */
export const getReturnDetails = async (req, res, next) => {
  try {
    const returnRequest = await ReturnRequest.findById(req.params.returnId)
      .populate('order')
      .populate('user', 'name email phone')
      .populate('items.product', 'title images')
      .populate('reviewedBy', 'name');

    if (!returnRequest) {
      return next(new AppError('Return request not found', 404));
    }

    if (returnRequest.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized', 403));
    }

    res.json({
      success: true,
      data: { returnRequest }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel return request
 * @route   PUT /api/returns/:returnId/cancel
 * @access  Private
 */
export const cancelReturn = async (req, res, next) => {
  try {
    const returnRequest = await ReturnRequest.findById(req.params.returnId);

    if (!returnRequest) {
      return next(new AppError('Return request not found', 404));
    }

    if (returnRequest.user.toString() !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    if (!['pending', 'approved'].includes(returnRequest.status)) {
      return next(new AppError('Cannot cancel return at this stage', 400));
    }

    returnRequest.status = 'cancelled';
    await returnRequest.save();

    res.json({
      success: true,
      message: 'Return request cancelled',
      data: { returnRequest }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all return requests (Admin)
 * @route   GET /api/returns/admin/requests
 * @access  Private (Admin)
 */
export const getReturnRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const returns = await ReturnRequest.find(query)
      .populate('order', 'orderNo total')
      .populate('user', 'name email phone')
      .populate('items.product', 'title images')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ReturnRequest.countDocuments(query);

    res.json({
      success: true,
      data: {
        returns,
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
 * @desc    Review return request (Admin)
 * @route   PUT /api/returns/admin/:returnId/review
 * @access  Private (Admin)
 */
export const reviewReturnRequest = async (req, res, next) => {
  try {
    const { action, rejectionReason } = req.body; // action: 'approve' or 'reject'

    const returnRequest = await ReturnRequest.findById(req.params.returnId).populate('order');

    if (!returnRequest) {
      return next(new AppError('Return request not found', 404));
    }

    if (returnRequest.status !== 'pending') {
      return next(new AppError('Return request already reviewed', 400));
    }

    if (action === 'approve') {
      returnRequest.status = 'approved';
      returnRequest.approvedAt = new Date();
      
      // Send notification
      await notificationService.sendNotification({
        user: returnRequest.user,
        type: 'return_approved',
        title: 'Return Request Approved',
        message: `Your return request ${returnRequest.returnNo} has been approved. Pickup will be scheduled soon.`,
        data: {
          returnNo: returnRequest.returnNo,
          refundAmount: returnRequest.refundAmount
        },
        referenceId: returnRequest._id.toString(),
        referenceModel: 'ReturnRequest'
      });
    } else if (action === 'reject') {
      returnRequest.status = 'rejected';
      returnRequest.rejectionReason = rejectionReason;
      
      // Send notification
      await notificationService.sendNotification({
        user: returnRequest.user,
        type: 'return_rejected',
        title: 'Return Request Rejected',
        message: `Your return request ${returnRequest.returnNo} has been rejected. Reason: ${rejectionReason}`,
        referenceId: returnRequest._id.toString(),
        referenceModel: 'ReturnRequest'
      });
    } else {
      return next(new AppError('Invalid action', 400));
    }

    returnRequest.reviewedBy = req.user.id;
    returnRequest.reviewedAt = new Date();
    await returnRequest.save();

    res.json({
      success: true,
      message: `Return request ${action}d successfully`,
      data: { returnRequest }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Schedule return pickup (Admin)
 * @route   POST /api/returns/admin/:returnId/schedule-pickup
 * @access  Private (Admin)
 */
export const scheduleReturnPickup = async (req, res, next) => {
  try {
    const returnRequest = await ReturnRequest.findById(req.params.returnId)
      .populate('order')
      .populate('user');

    if (!returnRequest) {
      return next(new AppError('Return request not found', 404));
    }

    if (returnRequest.status !== 'approved') {
      return next(new AppError('Return must be approved first', 400));
    }

    // Create return shipment on Shiprocket
    try {
      const shiprocketReturn = await shiprocketService.createReturn(
        returnRequest,
        returnRequest.order
      );

      returnRequest.shiprocketReturn = {
        returnId: shiprocketReturn.orderId,
        awb: shiprocketReturn.awb || ''
      };

      // Generate AWB if not already assigned
      if (!shiprocketReturn.awb && shiprocketReturn.shipmentId) {
        const awbResult = await shiprocketService.generateAWB(shiprocketReturn.shipmentId);
        returnRequest.shiprocketReturn.awb = awbResult.awb;
        returnRequest.shiprocketReturn.courierName = awbResult.courierName;
      }

      returnRequest.status = 'pickup_scheduled';
      returnRequest.pickupScheduledAt = new Date();

      await returnRequest.save();

      // Send notification
      await notificationService.sendNotification({
        user: returnRequest.user._id,
        type: 'return_pickup_scheduled',
        title: 'Return Pickup Scheduled',
        message: `Pickup has been scheduled for your return ${returnRequest.returnNo}. AWB: ${returnRequest.shiprocketReturn.awb}`,
        referenceId: returnRequest._id.toString(),
        referenceModel: 'ReturnRequest'
      });

      res.json({
        success: true,
        message: 'Return pickup scheduled successfully',
        data: { returnRequest }
      });
    } catch (error) {
      console.error('Shiprocket return creation failed:', error);
      return next(new AppError('Failed to schedule pickup with Shiprocket', 500));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update return status (Admin)
 * @route   PUT /api/returns/admin/:returnId/status
 * @access  Private (Admin)
 */
export const updateReturnStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const returnRequest = await ReturnRequest.findById(req.params.returnId);

    if (!returnRequest) {
      return next(new AppError('Return request not found', 404));
    }

    returnRequest.status = status;

    if (status === 'picked_up') {
      returnRequest.pickedUpAt = new Date();
    } else if (status === 'received') {
      returnRequest.receivedAt = new Date();
    }

    await returnRequest.save();

    res.json({
      success: true,
      message: 'Return status updated',
      data: { returnRequest }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Process refund (Admin)
 * @route   POST /api/returns/admin/:returnId/refund
 * @access  Private (Admin)
 */
export const processRefund = async (req, res, next) => {
  try {
    const { refundTransactionId, utrNumber } = req.body;

    const returnRequest = await ReturnRequest.findById(req.params.returnId)
      .populate('order')
      .populate('user');

    if (!returnRequest) {
      return next(new AppError('Return request not found', 404));
    }

    if (returnRequest.status !== 'received') {
      return next(new AppError('Return must be received before processing refund', 400));
    }

    if (returnRequest.refundStatus === 'completed') {
      return next(new AppError('Refund already processed', 400));
    }

    const order = returnRequest.order;

    // Process refund based on payment method
    if (returnRequest.refundMethod === 'wallet') {
      // Credit to wallet
      let wallet = await Wallet.findOne({ user: returnRequest.user._id });
      
      if (!wallet) {
        wallet = await Wallet.create({
          user: returnRequest.user._id,
          balance: 0
        });
      }

      wallet.balance += returnRequest.refundAmount;
      await wallet.save();

      // Create wallet transaction
      await WalletTransaction.create({
        wallet: wallet._id,
        user: returnRequest.user._id,
        type: 'credit',
        source: 'refund',
        amount: returnRequest.refundAmount,
        balanceAfter: wallet.balance,
        description: `Refund for return ${returnRequest.returnNo}`,
        referenceId: returnRequest._id.toString(),
        referenceModel: 'ReturnRequest',
        status: 'completed'
      });
    }
    // For online payments, manual bank transfer or payment gateway refund would be done

    // Update return request
    returnRequest.refundStatus = 'completed';
    returnRequest.refundTransactionId = refundTransactionId;
    returnRequest.refundedAt = new Date();
    returnRequest.status = 'refunded';
    await returnRequest.save();

    // Update order status
    order.orderStatus = 'returned';
    await order.save();

    // Restore stock for returned items
    for (const item of returnRequest.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    // Cancel reseller earnings if applicable
    if (order.reseller && order.resellerEarningStatus === 'pending') {
      order.resellerEarningStatus = 'cancelled';
      await order.save();
    } else if (order.reseller && order.resellerEarningStatus === 'credited') {
      // Deduct from reseller wallet
      const resellerWallet = await Wallet.findOne({ user: order.reseller });
      
      if (resellerWallet) {
        resellerWallet.balance -= order.resellerEarning;
        await resellerWallet.save();

        await WalletTransaction.create({
          wallet: resellerWallet._id,
          user: order.reseller,
          type: 'debit',
          source: 'reversal',
          amount: order.resellerEarning,
          balanceAfter: resellerWallet.balance,
          description: `Earning reversal for returned order ${order.orderNo}`,
          referenceId: order._id.toString(),
          referenceModel: 'Order',
          status: 'completed'
        });
      }
    }

    // Send notification
    await notificationService.sendNotification({
      user: returnRequest.user._id,
      type: 'refund_completed',
      title: 'Refund Processed',
      message: `Your refund of ₹${returnRequest.refundAmount} has been processed for return ${returnRequest.returnNo}`,
      data: {
        returnNo: returnRequest.returnNo,
        amount: returnRequest.refundAmount,
        method: returnRequest.refundMethod
      },
      referenceId: returnRequest._id.toString(),
      referenceModel: 'ReturnRequest'
    });

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: { returnRequest }
    });
  } catch (error) {
    next(error);
  }
};