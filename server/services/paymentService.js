// ============================================
// backend/services/paymentService.js
// ============================================
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';


/**
 * Initialize Razorpay
 */
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// let razorpay = null;

// SAFE INITIALIZATION
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
} else {
  console.warn("⚠️ Razorpay keys not set. Payment features are disabled.");
}

/**
 * Create Razorpay order
 */
export const createRazorpayOrder = async (order) => {
  try {
    const options = {
      amount: Math.round(order.total * 100), // Amount in paise
      currency: 'INR',
      receipt: order.orderNo,
      notes: {
        orderId: order._id.toString(),
        userId: order.user.toString()
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);
    return razorpayOrder;
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    throw new Error('Failed to create payment order');
  }
};

/**
 * Verify Razorpay payment signature
 */
export const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  const text = orderId + '|' + paymentId;
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(text)
    .digest('hex');

  return generatedSignature === signature;
};

/**
 * Handle Razorpay payment webhook
 */
export const verifyRazorpayPayment = async (webhookBody) => {
  const { event, payload } = webhookBody;

  if (event === 'payment.captured') {
    const { order_id, id: payment_id } = payload.payment.entity;

    // Find order by Razorpay order ID
    const order = await Order.findOne({ razorpayOrderId: order_id });

    if (order) {
      order.paymentStatus = 'completed';
      order.razorpayPaymentId = payment_id;
      order.paidAt = new Date();
      order.orderStatus = 'confirmed';
      order.confirmedAt = new Date();
      await order.save();

      console.log(`Payment successful for order: ${order.orderNo}`);
    }
  } else if (event === 'payment.failed') {
    const { order_id } = payload.payment.entity;

    const order = await Order.findOne({ razorpayOrderId: order_id });

    if (order) {
      order.paymentStatus = 'failed';
      await order.save();

      console.log(`Payment failed for order: ${order.orderNo}`);
    }
  }
};
