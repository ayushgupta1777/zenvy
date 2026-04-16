// backend/utils/OrderStateMachine.js

class OrderStateMachine {
  // Define valid state transitions
  static TRANSITIONS = {
    pending: ['confirmed', 'failed', 'cancelled'],
    confirmed: ['processing', 'cancelled', 'address_change_requested'],
    address_change_requested: ['confirmed', 'cancelled'],
    processing: ['packed', 'cancelled'],
    packed: ['shipped', 'cancelled'],
    shipped: ['out_for_delivery', 'delivered', 'delivery_failed'],
    out_for_delivery: ['delivered', 'delivery_failed'],
    delivery_failed: ['out_for_delivery', 'cancelled'],
    delivered: ['return_initiated', 'completed'],
    return_initiated: ['return_approved', 'return_rejected', 'return_cancelled'],
    return_approved: ['return_picked_up'],
    return_picked_up: ['return_received'],
    return_received: ['refunded'],
    return_rejected: [],
    return_cancelled: ['delivered'],
    completed: [],
    refunded: [],
    cancelled: [],
    failed: []
  };

  // Terminal states (cannot transition from these)
  static TERMINAL_STATES = ['completed', 'refunded', 'cancelled', 'failed'];

  /**
   * Validate if state transition is allowed
   */
  static canTransition(currentState, newState) {
    if (!this.TRANSITIONS[currentState]) {
      throw new Error(`Invalid current state: ${currentState}`);
    }

    if (this.TERMINAL_STATES.includes(currentState)) {
      return {
        allowed: false,
        reason: `Cannot transition from terminal state: ${currentState}`
      };
    }

    if (!this.TRANSITIONS[currentState].includes(newState)) {
      return {
        allowed: false,
        reason: `Invalid transition: ${currentState} → ${newState}`
      };
    }

    return { allowed: true };
  }

  /**
   * Get allowed next states
   */
  static getAllowedTransitions(currentState) {
    return this.TRANSITIONS[currentState] || [];
  }

  /**
   * Update order status with validation
   */
  static async updateOrderStatus(order, newStatus, metadata = {}) {
    const validation = this.canTransition(order.orderStatus, newStatus);

    if (!validation.allowed) {
      throw new Error(validation.reason);
    }

    // Save state history
    if (!order.statusHistory) {
      order.statusHistory = [];
    }

    order.statusHistory.push({
      from: order.orderStatus,
      to: newStatus,
      changedAt: new Date(),
      changedBy: metadata.changedBy,
      reason: metadata.reason,
      metadata: metadata.metadata
    });

    // Update status
    order.orderStatus = newStatus;

    // Set appropriate timestamps
    const timestampField = `${newStatus}At`;
    if (order.schema.path(timestampField)) {
      order[timestampField] = new Date();
    }

    // Handle status-specific logic
    await this.handleStatusChange(order, newStatus, metadata);

    return order;
  }

  /**
   * Handle side effects of status changes
   */
  static async handleStatusChange(order, newStatus, metadata) {
    switch (newStatus) {
      case 'confirmed':
        order.confirmedAt = new Date();
        // If COD, payment is considered received on delivery
        if (order.paymentMethod === 'cod') {
          // Payment will be marked completed on delivery
        }
        break;

      case 'delivered':
        order.deliveredAt = new Date();
        // 🎯 FIX: Calculate return window from delivery date
        order.returnWindowEndDate = new Date(
          order.deliveredAt.getTime() + order.returnWindow * 24 * 60 * 60 * 1000
        );

        // Mark payment as completed for COD
        if (order.paymentMethod === 'cod') {
          order.paymentStatus = 'completed';
        }
        break;

      case 'cancelled':
        order.cancelledAt = new Date();
        order.cancellationReason = metadata.reason;
        // Restore stock
        await this.restoreStock(order);
        // Reverse reseller earnings
        if (order.resellerEarning > 0) {
          await this.reverseResellerEarnings(order);
        }
        break;

      case 'refunded':
        order.refundedAt = new Date();
        // Restore stock
        await this.restoreStock(order);
        // Reverse reseller earnings
        if (order.resellerEarning > 0) {
          await this.reverseResellerEarnings(order);
        }
        break;

      case 'completed':
        // After 7 days, no return possible
        // Credit reseller earnings if applicable
        if (order.resellerEarning > 0 && order.resellerEarningStatus === 'pending') {
          await this.creditResellerEarnings(order);
        }
        break;
    }
  }

  static async restoreStock(order) {
    const Product = (await import('../models/Product.js')).default;
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, soldCount: -item.quantity }
      });
    }
  }

  static async creditResellerEarnings(order) {
    const Wallet = (await import('../models/Wallet.js')).default;
    const WalletTransaction = (await import('../models/WalletTransaction.js')).default;
    const User = (await import('../models/User.js')).default;

    // Use order.reseller if available, otherwise fallback to order.user
    const userId = order.reseller || order.user;
    const wallet = await Wallet.findOne({ user: userId });

    if (wallet) {
      if (wallet.pendingBalance >= order.resellerEarning) {
        wallet.pendingBalance -= order.resellerEarning;
      } else {
        wallet.pendingBalance = 0; // Safeguard
      }
      wallet.balance += order.resellerEarning;
      wallet.totalEarned += order.resellerEarning;
      await wallet.save();

      await WalletTransaction.create({
        wallet: wallet._id,
        user: userId,
        type: 'credit',
        source: 'resell_earning',
        amount: order.resellerEarning,
        balanceAfter: wallet.balance,
        description: `Earning from Order ${order.orderNo}`,
        referenceId: order._id,
        referenceModel: 'Order',
        status: 'completed'
      });

      order.resellerEarningStatus = 'credited';

      const notificationService = (await import('../services/notificationService.js')).default;
      const userObj = await User.findById(userId);
      if (userObj) {
        await notificationService.sendNotification({
          user: userId,
          type: 'wallet_credited',
          title: 'Earnings Credited! 💰',
          message: `Your earnings of ₹${order.resellerEarning} for Order ${order.orderNo} are now available to withdraw!`,
          data: { amount: order.resellerEarning, balance: wallet.balance }
        });
      }
    }
  }

  static async reverseResellerEarnings(order) {
    const Wallet = (await import('../models/Wallet.js')).default;
    const userId = order.reseller || order.user;
    const wallet = await Wallet.findOne({ user: userId });

    if (wallet && order.resellerEarningStatus === 'pending') {
      if (wallet.pendingBalance >= order.resellerEarning) {
        wallet.pendingBalance -= order.resellerEarning;
      } else {
        wallet.pendingBalance = 0;
      }
      await wallet.save();
      order.resellerEarningStatus = 'cancelled';
    }
  }
}

export default OrderStateMachine;