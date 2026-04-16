import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNo: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    sku: String, // ✅ ADD THIS FOR PERSISTENCE
    quantity: { type: Number, required: true, min: 1 },
    basePrice: { type: Number, required: true },
    resellPrice: { type: Number, default: 0 },
    finalPrice: { type: Number, required: true }
  }],

  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' }
  },

  // Pricing
  subtotal: { type: Number, required: true },
  shipping: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },

  // Payment
  paymentMethod: {
    type: String,
    enum: ['cod', 'upi', 'card'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: String,
  paymentError: String, // ✅ ADD THIS

  // Razorpay fields
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,

  // Order Status - ✅ FIXED ENUM
  orderStatus: {
    type: String,
    enum: [
      'pending',        // Initial state for online payment
      'confirmed',      // COD orders or after payment verification
      'processing',     // Admin started processing
      'packed',         // ✅ ADD THIS
      'shipped',        // Shiprocket shipment created
      'out_for_delivery', // ✅ ADD THIS
      'delivered',      // Successfully delivered
      'cancelled',      // Order cancelled
      'returned',       // Order returned
      'refunded',       // Order refunded
      'completed'       // Return window over or admin override
    ],
    default: 'pending'
  },

  // Status History - ✅ ADD THIS
  statusHistory: [{
    from: String,
    to: String,
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: String
  }],

  // Cancellation
  cancellationReason: String, // ✅ ADD THIS
  cancelledAt: Date,
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Timestamps
  confirmedAt: Date,
  processingAt: Date,
  packedAt: Date,
  shippedAt: Date,
  deliveredAt: Date,

  // Shiprocket Integration
  shiprocket: {
    orderId: String,
    shipmentId: String,
    awb: String,
    courierName: String,
    pickupScheduledDate: Date,
    labelUrl: String,
    manifestUrl: String
  },

  trackingNumber: String,
  courierName: String,
  trackingEvents: [{
    status: String,
    description: String,
    location: String,
    timestamp: Date
  }],

  // Reseller
  reseller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resellerEarning: { type: Number, default: 0 },
  resellerEarningStatus: {
    type: String,
    enum: ['pending', 'credited', 'cancelled'],
    default: 'pending'
  },

  // Coupon
  coupon: {
    code: String,
    discountAmount: { type: Number, default: 0 }
  },

  // Return Window
  returnWindow: { type: Number, default: 7 }, // days
  returnWindowEndDate: Date

}, { timestamps: true });

// ✅ ADD PRE-SAVE MIDDLEWARE FOR STATUS HISTORY
orderSchema.pre('save', function (next) {
  if (this.isModified('orderStatus')) {
    this.statusHistory.push({
      from: this._previousOrderStatus || 'none',
      to: this.orderStatus,
      changedAt: new Date()
    });
  }
  this._previousOrderStatus = this.orderStatus;
  next();
});

const Order = mongoose.model('Order', orderSchema);
export default Order;