// ============================================
// ENHANCED: Payment Controller with Comprehensive Error Handling
// backend/controllers/paymentController.js
// ============================================
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import { AppError } from '../middleware/errorHandler.js';
import dotenv from 'dotenv';
dotenv.config();

// Validate Razorpay credentials on startup
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('❌ CRITICAL: Razorpay credentials not configured!');
  console.error('   Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env file');
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * @desc    Create Razorpay order
 * @route   POST /api/payments/create-order
 * @access  Private
 */
export const createPaymentOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    console.log('💳 Creating payment order for:', orderId);

    // Validate Razorpay credentials
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('❌ Razorpay credentials missing');
      return next(new AppError('Payment gateway not configured. Please contact support.', 500));
    }

    // Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    // Check authorization
    if (order.user.toString() !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    // Check if order already has a Razorpay order ID
    if (order.razorpayOrderId) {
      console.log('✅ Returning existing Razorpay order:', order.razorpayOrderId);
      return res.json({
        success: true,
        data: {
          razorpayOrderId: order.razorpayOrderId,
          amount: order.total * 100,
          currency: 'INR',
          keyId: process.env.RAZORPAY_KEY_ID
        }
      });
    }

    // Create Razorpay order
    const razorpayOrderData = {
      amount: Math.round(order.total * 100), // Convert to paise and ensure integer
      currency: 'INR',
      receipt: order.orderNo,
      notes: {
        orderId: order._id.toString(),
        orderNo: order.orderNo,
        userId: req.user.id
      }
    };

    console.log('📄 Creating Razorpay order...', razorpayOrderData);

    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create(razorpayOrderData);
      console.log('✅ Razorpay order created:', razorpayOrder.id);
    } catch (razorpayError) {
      console.error('❌ Razorpay API Error:', {
        message: razorpayError.message,
        description: razorpayError.error?.description,
        statusCode: razorpayError.statusCode
      });

      // Check for specific Razorpay errors
      if (razorpayError.message?.includes('Authentication failed')) {
        return next(new AppError('Payment gateway authentication failed. Please contact support.', 500));
      }

      return next(new AppError('Failed to initialize payment. Please try again.', 500));
    }

    // Save Razorpay order ID to order
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error('❌ Payment order creation failed:', error);
    next(error);
  }
};

/**
 * @desc    Verify Razorpay payment
 * @route   POST /api/payments/verify
 * @access  Private
 */
export const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body;

    console.log('🔐 Verifying payment:', {
      orderId,
      razorpay_order_id,
      razorpay_payment_id
    });

    // CRITICAL: Verify signature FIRST before updating any order status
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      console.error('❌ CRITICAL: Invalid payment signature!');
      console.error('   Expected:', expectedSignature);
      console.error('   Received:', razorpay_signature);
      console.error('   Payment ID:', razorpay_payment_id);
      
      // Log this critical security issue
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentStatus = 'verification_failed';
        order.paymentError = `Signature mismatch. Payment ID: ${razorpay_payment_id}`;
        await order.save();
      }

      return next(new AppError('Invalid payment signature. This payment cannot be verified.', 400));
    }

    console.log('✅ Payment signature verified successfully');

    // Additional verification: Fetch payment details from Razorpay to confirm
    let razorpayPaymentDetails;
    try {
      razorpayPaymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
      console.log('📋 Razorpay payment details:', {
        id: razorpayPaymentDetails.id,
        status: razorpayPaymentDetails.status,
        method: razorpayPaymentDetails.method,
        amount: razorpayPaymentDetails.amount,
        captured: razorpayPaymentDetails.captured
      });

      // CRITICAL CHECK: Verify payment status
      if (razorpayPaymentDetails.status !== 'captured' && razorpayPaymentDetails.status !== 'authorized') {
        console.error('❌ Payment not successful. Status:', razorpayPaymentDetails.status);
        
        const order = await Order.findById(orderId);
        if (order) {
          order.paymentStatus = 'failed';
          order.paymentError = `Payment status: ${razorpayPaymentDetails.status}`;
          order.razorpayPaymentId = razorpay_payment_id;
          await order.save();
        }

        return next(new AppError(`Payment failed with status: ${razorpayPaymentDetails.status}`, 400));
      }

    } catch (fetchError) {
      console.error('⚠️ Could not fetch payment details from Razorpay:', fetchError);
      // Continue anyway if signature is valid, but log the issue
    }

    // Find and update order
    const order = await Order.findById(orderId);
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    // Double-check that the payment hasn't already been processed
    if (order.paymentStatus === 'completed') {
      console.log('⚠️ Payment already processed for this order');
      await order.populate('items.product', 'title images');
      return res.json({
        success: true,
        message: 'Payment already verified',
        data: { order }
      });
    }

    // Update order payment details
    order.paymentStatus = 'completed';
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.orderStatus = 'confirmed';
    order.confirmedAt = new Date();

    // Add payment method info if available
    if (razorpayPaymentDetails) {
      order.paymentMethod = razorpayPaymentDetails.method || 'online';
    }

    await order.save();

    console.log('✅ Order payment confirmed:', order.orderNo);

    // Add to reseller wallet if applicable
    if (order.resellerEarning > 0) {
      try {
        const Wallet = (await import('../models/Wallet.js')).default;
        const wallet = await Wallet.findOne({ user: order.user });
        if (wallet) {
          wallet.pendingBalance += order.resellerEarning;
          await wallet.save();
          console.log('💰 Added to reseller wallet:', order.resellerEarning);
        }
      } catch (walletError) {
        console.error('⚠️ Failed to update wallet:', walletError);
        // Don't fail the entire payment verification if wallet update fails
      }
    }

    // Populate order for response
    await order.populate('items.product', 'title images');

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: { order }
    });
  } catch (error) {
    console.error('❌ Payment verification failed:', error);
    next(error);
  }
};

/**
 * @desc    Handle payment failure
 * @route   POST /api/payments/failure
 * @access  Private
 */
export const handlePaymentFailure = async (req, res, next) => {
  try {
    const { orderId, error } = req.body;

    console.log('❌ Payment failed for order:', orderId);
    console.log('   Error details:', error);

    const order = await Order.findById(orderId);
    if (order) {
      // Only update if payment isn't already completed
      if (order.paymentStatus !== 'completed') {
        order.paymentStatus = 'failed';
        order.paymentError = error;
        order.paymentFailedAt = new Date();
        await order.save();
        console.log('📝 Payment failure recorded in order');
      } else {
        console.log('⚠️ Order already has completed payment, not updating to failed');
      }
    }

    res.json({
      success: true,
      message: 'Payment failure recorded'
    });
  } catch (error) {
    console.error('❌ Error recording payment failure:', error);
    next(error);
  }
};

/**
 * @desc    Handle verification failure (payment succeeded but verification failed)
 * @route   POST /api/payments/verification-failed
 * @access  Private
 */
export const handleVerificationFailure = async (req, res, next) => {
  try {
    const { orderId, razorpayData, error } = req.body;

    console.log('⚠️ CRITICAL: Verification failed for order:', orderId);
    console.log('   Payment ID:', razorpayData?.razorpay_payment_id);
    console.log('   Error:', error);

    const order = await Order.findById(orderId);
    if (order) {
      order.paymentStatus = 'verification_failed';
      order.razorpayPaymentId = razorpayData?.razorpay_payment_id;
      order.razorpayOrderId = razorpayData?.razorpay_order_id;
      order.paymentError = JSON.stringify({
        error,
        razorpayData,
        timestamp: new Date()
      });
      await order.save();

      // TODO: Send alert to admin about verification failure
      // This requires manual intervention to check with Razorpay
      console.log('🚨 ADMIN ALERT NEEDED: Verification failure for order', order.orderNo);
    }

    res.json({
      success: true,
      message: 'Verification failure recorded. Please contact support.'
    });
  } catch (error) {
    console.error('❌ Error recording verification failure:', error);
    next(error);
  }
};

/**
 * @desc    Get payment status (for debugging/support)
 * @route   GET /api/payments/:orderId/status
 * @access  Private
 */
export const getPaymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    // Check authorization
    if (order.user.toString() !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    let razorpayStatus = null;
    if (order.razorpayPaymentId) {
      try {
        const payment = await razorpay.payments.fetch(order.razorpayPaymentId);
        razorpayStatus = {
          id: payment.id,
          status: payment.status,
          method: payment.method,
          amount: payment.amount / 100,
          captured: payment.captured,
          created_at: payment.created_at
        };
      } catch (fetchError) {
        console.error('Could not fetch Razorpay payment status:', fetchError);
      }
    }

    res.json({
      success: true,
      data: {
        orderNo: order.orderNo,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        total: order.total,
        razorpayOrderId: order.razorpayOrderId,
        razorpayPaymentId: order.razorpayPaymentId,
        razorpayStatus,
        paymentError: order.paymentError,
        confirmedAt: order.confirmedAt,
        paymentFailedAt: order.paymentFailedAt
      }
    });
  } catch (error) {
    console.error('❌ Error fetching payment status:', error);
    next(error);
  }
};