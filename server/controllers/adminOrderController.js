import Order from '../models/Order.js';
import { AppError } from '../middleware/errorHandler.js';
import OrderStateMachine from '../utils/OrderStateMachine.js';

/**
 * @desc    Get all orders with filters
 * @route   GET /api/admin/orders
 * @access  Private (Admin)
 */
export const getAllOrders = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    // Build query
    const query = {};
    if (status && status !== 'all') {
      query.orderStatus = status;
    }
    if (search) {
      query.$or = [
        { orderNo: { $regex: search, $options: 'i' } },
        { 'user.name': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

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
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get order statistics
 * @route   GET /api/admin/orders/stats
 * @access  Private (Admin)
 */
export const getOrderStats = async (req, res, next) => {
  try {
    const { timeframe, startDate: customStart, endDate: customEnd } = req.query;

    // Build date query
    let dateQuery = {};
    const now = new Date();

    if (timeframe === 'today') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      dateQuery = { createdAt: { $gte: startOfDay } };
    } else if (timeframe === 'week') {
      const startOfWeek = new Date(now.setDate(now.getDate() - 7));
      dateQuery = { createdAt: { $gte: startOfWeek } };
    } else if (timeframe === 'month') {
      const startOfMonth = new Date(now.setMonth(now.getMonth() - 1));
      dateQuery = { createdAt: { $gte: startOfMonth } };
    } else if (timeframe === 'custom' && customStart && customEnd) {
      dateQuery = {
        createdAt: {
          $gte: new Date(customStart),
          $lte: new Date(customEnd)
        }
      };
    }

    const totalOrders = await Order.countDocuments(dateQuery);
    const pendingOrders = await Order.countDocuments({ ...dateQuery, orderStatus: 'pending' });
    const confirmedOrders = await Order.countDocuments({ ...dateQuery, orderStatus: 'confirmed' });
    const processingOrders = await Order.countDocuments({ ...dateQuery, orderStatus: 'processing' });
    const packedOrders = await Order.countDocuments({ ...dateQuery, orderStatus: 'packed' });
    const shippedOrders = await Order.countDocuments({ ...dateQuery, orderStatus: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ ...dateQuery, orderStatus: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ ...dateQuery, orderStatus: 'cancelled' });

    // Calculate total revenue (only from delivered orders in timeframe)
    const revenueResult = await Order.aggregate([
      { $match: { ...dateQuery, orderStatus: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Get recent orders (always last 5, regardless of timeframe)
    const recentOrders = await Order.find()
      .populate('user', 'name')
      .sort('-createdAt')
      .limit(5);

    res.json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        confirmedOrders,
        processingOrders,
        packedOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue,
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single order (admin)
 * @route   GET /api/admin/orders/:orderId
 * @access  Private (Admin)
 */
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('user', 'name email phone')
      .populate('items.product', 'title images');

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status
 * @route   PUT /api/admin/orders/:orderId/status
 * @access  Private (Admin)
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    // Validate status transition
    const validStatuses = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return next(new AppError('Invalid status. Valid statuses are: ' + validStatuses.join(', '), 400));
    }

    await OrderStateMachine.updateOrderStatus(order, status, {
      changedBy: req.user ? req.user.id : null,
      reason: `Admin updated status to ${status}`
    });

    await order.save();

    // TODO: Send notification to customer

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
 * @desc    Cancel order (admin)
 * @route   PUT /api/admin/orders/:orderId/cancel
 * @access  Private (Admin)
 */
export const cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    if (['delivered', 'cancelled'].includes(order.orderStatus)) {
      return next(new AppError('Cannot cancel this order', 400));
    }

    await OrderStateMachine.updateOrderStatus(order, 'cancelled', {
      changedBy: req.user ? req.user.id : null,
      reason: reason || 'Admin cancelled order'
    });

    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};
