import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Wallet from '../models/Wallet.js';
import Coupon from '../models/Coupon.js';
import { AppError } from '../middleware/errorHandler.js';
import OrderStateMachine from '../utils/OrderStateMachine.js';

// Generate unique order number
const generateOrderNumber = async () => {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const count = await Order.countDocuments();
  return `ORD${yyyy}${mm}${dd}${String(count + 1).padStart(5, '0')}`;
};

export const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod, couponCode } = req.body;

    console.log('📦 CREATE ORDER - Received:', { shippingAddress, paymentMethod });

    // Validate
    if (!shippingAddress || !shippingAddress.name || !shippingAddress.phone) {
      return next(new AppError('Complete address required', 400));
    }

    if (!paymentMethod || !['cod', 'upi', 'card'].includes(paymentMethod)) {
      return next(new AppError('Invalid payment method', 400));
    }

    // Get cart
    const cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'title stock sku');

    if (!cart || cart.items.length === 0) {
      return next(new AppError('Cart is empty', 400));
    }

    console.log('✅ Cart items:', cart.items.length);

    // Validate stock
    for (const item of cart.items) {
      const product = item.product;
      if (product.stock < item.quantity) {
        return next(new AppError(`${product.title} out of stock`, 400));
      }
    }

    // Calculate totals
    const subtotal = cart.totalPrice;
    const baseSubtotal = cart.items.reduce((sum, item) => sum + (item.basePrice * item.quantity), 0);
    let shipping = subtotal >= 500 ? 0 : 50;
    
    // Fixed: Hardcode taxRate to 3 to strictly enforce 3% GST calculation everywhere.
    // Previous relying on process.env.TAX_RATE caused 18% fallback on existing production servers.
    const taxRate = 3; 
    const tax = Math.round(subtotal * (taxRate / 100));
    let total = subtotal + shipping + tax;

    // Handle Coupon
    let couponDetails = null;
    let appliedDiscount = 0;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        expiryDate: { $gt: new Date() }
      });

      if (!coupon) {
        return next(new AppError('Invalid or expired coupon', 400));
      }

      // Check usage limits
      if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        return next(new AppError('Coupon usage limit reached', 400));
      }

      // Check min order amount
      if (baseSubtotal < coupon.minOrderAmount) {
        return next(new AppError(`Minimum order amount for this coupon is ₹${coupon.minOrderAmount}`, 400));
      }

      // Check per-user limit
      const userUsage = coupon.usersUsed.find(u => u.user.toString() === req.user.id);
      if (userUsage && userUsage.count >= coupon.perUserLimit) {
        return next(new AppError('You have already used this coupon', 400));
      }

      // Calculate discount
      if (coupon.discountType === 'percentage') {
        appliedDiscount = (baseSubtotal * coupon.discountAmount) / 100;
        if (coupon.maxDiscountAmount && appliedDiscount > coupon.maxDiscountAmount) {
          appliedDiscount = coupon.maxDiscountAmount;
        }
      } else {
        appliedDiscount = coupon.discountAmount;
      }

      // Ensure discount doesn't exceed subtotal
      if (appliedDiscount > baseSubtotal) {
        appliedDiscount = baseSubtotal;
      }

      appliedDiscount = Math.round(appliedDiscount);
      total -= appliedDiscount;
      couponDetails = {
        code: coupon.code,
        discountAmount: appliedDiscount
      };
    }

    // Generate order number
    const orderNo = await generateOrderNumber();

    // Calculate reseller earnings
    let totalResellerEarning = 0;
    cart.items.forEach(item => {
      totalResellerEarning += item.resellPrice * item.quantity;
    });

    console.log('💰 Reseller earning:', totalResellerEarning);

    // ✅ FIX: Correct status based on payment method
    let orderStatus, paymentStatus;

    if (paymentMethod === 'cod') {
      // COD orders are immediately confirmed
      orderStatus = 'confirmed';
      paymentStatus = 'pending'; // Will be 'completed' after delivery
    } else {
      // Online payment orders start as pending
      orderStatus = 'pending';
      paymentStatus = 'pending'; // Will be updated after Razorpay verification
    }

    // ✅ FIX: Determine reseller explicitly
    const resellerId = totalResellerEarning > 0 ? req.user.id : null;

    // Create order
    const order = await Order.create({
      orderNo,
      user: req.user.id,
      items: cart.items.map(item => ({
        product: item.product._id,
        sku: item.product.sku, // ✅ Store SKU at time of order
        quantity: item.quantity,
        basePrice: item.basePrice,
        resellPrice: item.resellPrice,
        finalPrice: item.finalPrice
      })),
      shippingAddress,
      subtotal,
      shipping,
      tax,
      total,
      paymentMethod,
      paymentStatus,      // ✅ Dynamic based on payment method
      orderStatus,        // ✅ Dynamic based on payment method
      confirmedAt: paymentMethod === 'cod' ? new Date() : null, // ✅ COD confirmed immediately
      reseller: resellerId,
      resellerEarning: totalResellerEarning,
      resellerEarningStatus: 'pending',
      returnWindowEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      coupon: couponDetails
    });

    // Update Coupon usage tracking
    if (couponDetails) {
      const coupon = await Coupon.findOne({ code: couponDetails.code });
      if (coupon) {
        coupon.usedCount += 1;
        const userUsageIndex = coupon.usersUsed.findIndex(u => u.user.toString() === req.user.id);
        if (userUsageIndex !== -1) {
          coupon.usersUsed[userUsageIndex].count += 1;
        } else {
          coupon.usersUsed.push({ user: req.user.id, count: 1 });
        }
        await coupon.save();
      }
    }

    // Auto add to reseller wallet as pending for COD (since COD is immediately confirmed)
    if (paymentMethod === 'cod' && totalResellerEarning > 0) {
      const wallet = await Wallet.findOne({ user: req.user.id });
      if (wallet) {
        wallet.pendingBalance += totalResellerEarning;
        await wallet.save();
      }
    }

    console.log('✅ Order created:', order.orderNo, 'Status:', order.orderStatus);

    // Deduct stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    // Populate for response
    await order.populate('items.product', 'title images');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order }
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'title images')
      .sort('-createdAt');

    res.json({ success: true, data: { orders } });
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('items.product', 'title images sku');

    if (!order) return next(new AppError('Order not found', 404));

    // if (order.user.toString() !== req.user.id) {
    //   return next(new AppError('Not authorized', 403));
    // }

    res.json({ success: true, data: { order } });
  } catch (error) {
    next(error);
  }
};

export const updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus, paymentId } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order) return next(new AppError('Order not found', 404));

    order.paymentStatus = paymentStatus;
    if (paymentId) order.paymentId = paymentId;

    if (paymentStatus === 'completed') {
      order.orderStatus = 'confirmed';
      order.confirmedAt = new Date();

      // Auto add to reseller wallet as pending
      if (order.resellerEarning > 0) {
        // Query using reseller or user since it's the same here
        const wallet = await Wallet.findOne({ user: order.reseller || order.user });
        if (wallet) {
          wallet.pendingBalance += order.resellerEarning;
          await wallet.save();
        }
      }
    }

    await order.save();
    res.json({ success: true, data: { order } });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.orderId);
    if (!order) return next(new AppError('Order not found', 404));

    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized', 403));
    }

    // ✅ FIX: Check if cancellation is allowed
    // If already cancelled, just return success (idempotency)
    if (order.orderStatus === 'cancelled') {
       return res.json({
         success: true,
         message: 'Order was already cancelled',
         data: { order }
       });
    }

    const cancellableStatuses = ['pending', 'confirmed', 'processing'];
    if (!cancellableStatuses.includes(order.orderStatus)) {
      return next(new AppError(`Cannot cancel order in ${order.orderStatus} status`, 400));
    }

    // ✅ PREVENT CANCELLING SHIPPED ORDERS
    if (order.shiprocket && order.shiprocket.shipmentId) {
      return next(new AppError('Cannot cancel shipped orders. Please request a return instead.', 400));
    }

    await OrderStateMachine.updateOrderStatus(order, 'cancelled', {
      changedBy: req.user.id,
      reason: reason || 'Customer requested cancellation'
    });

    // ✅ HANDLE REFUNDS (ONLY FOR ONLINE PAYMENTS)
    if (order.paymentMethod !== 'cod' && order.paymentStatus === 'completed') {
      // Mark for refund (actual refund processed by admin)
      order.paymentStatus = 'refunded';
      // TODO: Implement Razorpay refund API call here
    }

    await order.save();

    // ✅ SEND NOTIFICATION
    await notificationService.sendNotification({
      user: order.user,
      type: 'order_cancelled',
      title: 'Order Cancelled',
      message: `Your order ${order.orderNo} has been cancelled.`,
      referenceId: order._id.toString(),
      referenceModel: 'Order'
    });

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

export default { createOrder, getMyOrders, getOrder, updatePaymentStatus, cancelOrder };

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:orderId/status
 * @access  Private (Vendor/Admin)
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    await OrderStateMachine.updateOrderStatus(order, status, {
      changedBy: req.user ? req.user.id : null,
      reason: `Status updated to ${status}`
    });

    await order.save();

    // Send notification
    await notificationService.sendNotification({
      user: order.user,
      type: `order_${status}`,
      title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your order ${order.orderNo} is now ${status}.`,
      referenceId: order._id.toString(),
      referenceModel: 'Order'
    });

    res.json({
      success: true,
      message: 'Order status updated',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get order tracking
 * @route   GET /api/orders/:orderId/tracking
 * @access  Private
 */
export const getOrderTracking = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized', 403));
    }

    let trackingData = null;

    // Get tracking from Shiprocket if shipment exists
    if (order.shiprocket && order.shiprocket.shipmentId) {
      try {
        trackingData = await shiprocketService.trackShipment(order.shiprocket.shipmentId);

        // Update tracking events in order
        if (trackingData.shipmentTrackActivities) {
          order.trackingEvents = trackingData.shipmentTrackActivities.map(event => ({
            status: event.activity,
            description: event.sr_status_label || event.activity,
            location: event.location || '',
            timestamp: new Date(event.date)
          }));

          await order.save();
        }
      } catch (error) {
        console.error('Failed to fetch tracking:', error.message);
      }
    }

    res.json({
      success: true,
      data: {
        order: {
          orderNo: order.orderNo,
          status: order.orderStatus,
          trackingNumber: order.trackingNumber,
          courierName: order.courierName,
          trackingEvents: order.trackingEvents
        },
        shiprocketTracking: trackingData
      }
    });
  } catch (error) {
    next(error);
  }
};

