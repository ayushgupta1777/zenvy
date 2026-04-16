// ============================================
// controllers/webhookController.js
// Webhook Handlers for External Services
// ============================================
import crypto from 'crypto';
import Order from '../models/Order.js';
import ReturnRequest from '../models/ReturnRequest.js';
import notificationService from '../services/notificationService.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * @desc    Shiprocket webhook handler
 * @route   POST /api/webhooks/shiprocket
 * @access  Public (verified via signature)
 */
export const shiprocketWebhook = async (req, res, next) => {
  try {
    console.log('📥 Shiprocket webhook received:', req.body);

    const event = req.body;

    // Verify webhook signature if secret is configured
    if (process.env.SHIPROCKET_WEBHOOK_SECRET) {
      const signature = req.headers['x-shiprocket-signature'];
      const expectedSignature = crypto
        .createHmac('sha256', process.env.SHIPROCKET_WEBHOOK_SECRET)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('❌ Invalid webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    // Handle different webhook events
    switch (event.type || event.event) {
      case 'shipment_status_update':
      case 'status_update':
        await handleShipmentStatusUpdate(event);
        break;

      case 'shipment_pickup':
        await handleShipmentPickup(event);
        break;

      case 'shipment_delivered':
        await handleShipmentDelivered(event);
        break;

      case 'return_status_update':
        await handleReturnStatusUpdate(event);
        break;

      case 'ndr_update':
        await handleNDRUpdate(event);
        break;

      default:
        console.log('⚠️ Unhandled webhook event:', event.type || event.event);
    }

    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

/**
 * Handle shipment status update
 */
async function handleShipmentStatusUpdate(event) {
  const { awb, current_status, order_id } = event.data || event;

  console.log(`📦 Status update for AWB ${awb}: ${current_status}`);

  // Find order by AWB or order number
  const order = await Order.findOne({
    $or: [
      { 'shiprocket.awb': awb },
      { orderNo: order_id }
    ]
  });

  if (!order) {
    console.error(`❌ Order not found for AWB ${awb}`);
    return;
  }

  // Add tracking event
  order.trackingEvents.push({
    status: current_status,
    description: event.data?.status_label || current_status,
    location: event.data?.location || '',
    timestamp: new Date(event.data?.updated_at || Date.now())
  });

  // Update order status based on shipment status
  const statusMap = {
    'PICKUP SCHEDULED': 'processing',
    'PICKED UP': 'shipped',
    'IN TRANSIT': 'shipped',
    'OUT FOR DELIVERY': 'shipped',
    'DELIVERED': 'delivered',
    'RTO': 'cancelled',
    'RETURNED': 'returned',
    // Numeric status codes from Shiprocket
    '6': 'shipped',          // Shipped
    '7': 'delivered',        // Delivered
    '13': 'returned',        // Returned
    '17': 'shipped',          // Out for delivery
    '18': 'shipped',          // In transit
    '19': 'shipped',          // Handed over
    '21': 'shipped',          // Re-attempted
    '22': 'shipped',          // Delivery re-attempted
    '11': 'processing',       // Pickup Scheduled
    '10': 'processing'        // Ready to ship
  };

  const statusKey = String(current_status).toUpperCase();
  const newOrderStatus = statusMap[statusKey];

  if (!newOrderStatus) {
    console.log(`ℹ️ No mapping found for Shiprocket status: ${current_status}`);
  }

  if (newOrderStatus && order.orderStatus !== newOrderStatus) {
    order.orderStatus = newOrderStatus;

    if (newOrderStatus === 'shipped') {
      order.shippedAt = new Date();

      await notificationService.sendNotification({
        user: order.user,
        type: 'order_shipped',
        title: 'Order Shipped',
        message: `Your order ${order.orderNo} has been shipped.`,
        data: {
          orderNo: order.orderNo,
          trackingNumber: awb,
          courierName: event.data?.courier_name || order.courierName
        },
        referenceId: order._id.toString(),
        referenceModel: 'Order'
      });
    } else if (newOrderStatus === 'delivered') {
      order.deliveredAt = new Date();
      order.paymentStatus = 'completed';

      // Calculate return window end date
      const returnWindowDays = order.returnWindow || 7;
      order.returnWindowEndDate = new Date(Date.now() + returnWindowDays * 24 * 60 * 60 * 1000);

      await notificationService.sendNotification({
        user: order.user,
        type: 'order_delivered',
        title: 'Order Delivered',
        message: `Your order ${order.orderNo} has been delivered successfully.`,
        data: {
          orderNo: order.orderNo,
          returnWindow: returnWindowDays
        },
        referenceId: order._id.toString(),
        referenceModel: 'Order'
      });
    }
  }

  await order.save();
  console.log(`✅ Order ${order.orderNo} updated with status: ${current_status}`);
}

/**
 * Handle shipment pickup
 */
async function handleShipmentPickup(event) {
  const { awb, order_id } = event.data || event;

  const order = await Order.findOne({
    $or: [
      { 'shiprocket.awb': awb },
      { orderNo: order_id }
    ]
  });

  if (order) {
    order.orderStatus = 'shipped';
    order.shippedAt = new Date();
    await order.save();

    await notificationService.sendNotification({
      user: order.user,
      type: 'order_shipped',
      title: 'Order Shipped',
      message: `Your order ${order.orderNo} has been picked up and is on its way.`,
      referenceId: order._id.toString(),
      referenceModel: 'Order'
    });
  }
}

/**
 * Handle shipment delivered
 */
async function handleShipmentDelivered(event) {
  const { awb, order_id, delivered_date } = event.data || event;

  const order = await Order.findOne({
    $or: [
      { 'shiprocket.awb': awb },
      { orderNo: order_id }
    ]
  });

  if (order && order.orderStatus !== 'delivered') {
    order.orderStatus = 'delivered';
    order.deliveredAt = new Date(delivered_date || Date.now());
    order.paymentStatus = 'completed';

    // Calculate return window
    const returnWindowDays = order.returnWindow || 7;
    order.returnWindowEndDate = new Date(order.deliveredAt.getTime() + returnWindowDays * 24 * 60 * 60 * 1000);

    await order.save();

    await notificationService.sendNotification({
      user: order.user,
      type: 'order_delivered',
      title: 'Order Delivered! 📦',
      message: `Your order ${order.orderNo} has been delivered. You can return within ${returnWindowDays} days if needed.`,
      referenceId: order._id.toString(),
      referenceModel: 'Order'
    });
  }
}

/**
 * Handle return status update
 */
async function handleReturnStatusUpdate(event) {
  const { awb, current_status, order_id } = event.data || event;

  const returnRequest = await ReturnRequest.findOne({
    $or: [
      { 'shiprocketReturn.awb': awb },
      { returnNo: order_id }
    ]
  }).populate('order');

  if (!returnRequest) {
    console.error(`❌ Return request not found for AWB ${awb}`);
    return;
  }

  // Update return status based on tracking
  const returnStatusMap = {
    'PICKED UP': 'picked_up',
    'IN TRANSIT': 'picked_up',
    'DELIVERED': 'received'
  };

  const newReturnStatus = returnStatusMap[current_status];
  if (newReturnStatus) {
    returnRequest.status = newReturnStatus;

    if (newReturnStatus === 'picked_up') {
      returnRequest.pickedUpAt = new Date();
    } else if (newReturnStatus === 'received') {
      returnRequest.receivedAt = new Date();
    }

    await returnRequest.save();

    await notificationService.sendNotification({
      user: returnRequest.user,
      type: 'return_status_update',
      title: 'Return Status Update',
      message: `Your return ${returnRequest.returnNo} status: ${current_status}`,
      referenceId: returnRequest._id.toString(),
      referenceModel: 'ReturnRequest'
    });
  }
}

/**
 * Handle NDR (Non-Delivery Report) update
 */
async function handleNDRUpdate(event) {
  const { awb, ndr_status, order_id } = event.data || event;

  const order = await Order.findOne({
    $or: [
      { 'shiprocket.awb': awb },
      { orderNo: order_id }
    ]
  });

  if (order) {
    // Add NDR event to tracking
    order.trackingEvents.push({
      status: 'NDR',
      description: `Non-Delivery Report: ${ndr_status}`,
      location: event.data?.location || '',
      timestamp: new Date()
    });

    await order.save();

    // Notify customer about delivery issue
    await notificationService.sendNotification({
      user: order.user,
      type: 'delivery_issue',
      title: 'Delivery Attempt Failed',
      message: `There was an issue delivering your order ${order.orderNo}. Reason: ${ndr_status}`,
      referenceId: order._id.toString(),
      referenceModel: 'Order'
    });
  }
}

/**
 * @desc    Razorpay webhook handler
 * @route   POST /api/webhooks/razorpay
 * @access  Public (verified via signature)
 */
/**
 * @desc    Razorpay webhook handler
 * @route   POST /api/webhooks/razorpay
 * @access  Public
 */
export const razorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    // ✅ FIX: Parse raw body for signature verification
    const rawBody = JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('❌ Invalid Razorpay webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    console.log('🔔 Razorpay webhook event:', event.event);

    // ✅ HANDLE EVENTS
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;

      // 🔴 THIS WAS YOUR MAIN BUG — FIXED HERE
      const order = await Order.findOne({
        razorpayOrderId: payment.order_id
      });

      if (!order) {
        console.error('❌ Order not found for Razorpay order:', payment.order_id);
        return res.json({ success: true });
      }

      order.paymentStatus = 'completed';
      order.razorpayPaymentId = payment.id;
      order.paidAt = new Date();
      order.orderStatus = 'confirmed';
      order.confirmedAt = new Date();

      await order.save();

      console.log(`✅ Payment captured for order ${order.orderNo}`);
    }

    if (event.event === 'payment.failed') {
      const payment = event.payload.payment.entity;

      const order = await Order.findOne({
        razorpayOrderId: payment.order_id
      });

      if (order) {
        order.paymentStatus = 'failed';
        await order.save();

        console.log(`❌ Payment failed for order ${order.orderNo}`);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Razorpay webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};


/**
 * Handle payment captured
 */
async function handlePaymentCaptured(event) {
  const payment = event.payload.payment.entity;

  // Find order by payment ID
  const order = await Order.findOne({
    razorpayPaymentId: payment.id
  });

  if (order && order.paymentStatus !== 'completed') {
    order.paymentStatus = 'completed';
    order.paidAt = new Date();
    order.orderStatus = 'confirmed';
    order.confirmedAt = new Date();

    await order.save();

    await notificationService.sendNotification({
      user: order.user,
      type: 'payment_success',
      title: 'Payment Successful',
      message: `Payment for order ${order.orderNo} has been confirmed.`,
      data: {
        orderNo: order.orderNo,
        amount: payment.amount / 100 // Convert paise to rupees
      },
      referenceId: order._id.toString(),
      referenceModel: 'Order'
    });

    console.log(`✅ Payment captured for order ${order.orderNo}`);
  }
}

/**
 * Handle payment failed
 */
async function handlePaymentFailed(event) {
  const payment = event.payload.payment.entity;

  const order = await Order.findOne({
    razorpayPaymentId: payment.id
  });

  if (order) {
    order.paymentStatus = 'failed';
    await order.save();

    await notificationService.sendNotification({
      user: order.user,
      type: 'payment_failed',
      title: 'Payment Failed',
      message: `Payment for order ${order.orderNo} failed. Please try again.`,
      referenceId: order._id.toString(),
      referenceModel: 'Order'
    });

    console.log(`❌ Payment failed for order ${order.orderNo}`);
  }
}

/**
 * Handle refund processed
 */
async function handleRefundProcessed(event) {
  const refund = event.payload.refund.entity;

  // Find return request by refund transaction ID
  const returnRequest = await ReturnRequest.findOne({
    refundTransactionId: refund.id
  });

  if (returnRequest && returnRequest.refundStatus !== 'completed') {
    returnRequest.refundStatus = 'completed';
    returnRequest.refundedAt = new Date();
    await returnRequest.save();

    await notificationService.sendNotification({
      user: returnRequest.user,
      type: 'refund_completed',
      title: 'Refund Processed',
      message: `Your refund of ₹${refund.amount / 100} has been processed.`,
      referenceId: returnRequest._id.toString(),
      referenceModel: 'ReturnRequest'
    });

    console.log(`✅ Refund processed for return ${returnRequest.returnNo}`);
  }
}

export default {
  shiprocketWebhook,
  razorpayWebhook
};


