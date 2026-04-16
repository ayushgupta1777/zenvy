
import mongoose from 'mongoose';

// 4. RETURN REQUEST MODEL
const returnRequestSchema = new mongoose.Schema({
  returnNo: { type: String, required: true, unique: true },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    orderItem: { type: mongoose.Schema.Types.ObjectId },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    reason: String,
    images: [String]
  }],
  returnReason: {
    type: String,
    enum: ['damaged', 'wrong_product', 'not_as_described', 'quality_issue', 'other'],
    required: true
  },
  returnDescription: String,
  returnImages: [String],
  
  // Return Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'pickup_scheduled', 'picked_up', 'received', 'refunded', 'cancelled'],
    default: 'pending'
  },
  
  // Admin Review
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  rejectionReason: String,
  
  // Shiprocket Return
  shiprocketReturn: {
    returnId: String,
    awb: String,
    courierName: String,
    trackingUrl: String
  },
  
  // Refund
  refundAmount: Number,
  refundMethod: {
    type: String,
    enum: ['original_payment', 'wallet', 'bank_transfer']
  },
  refundStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  refundTransactionId: String,
  refundedAt: Date,
  
  // Timestamps
  approvedAt: Date,
  pickupScheduledAt: Date,
  pickedUpAt: Date,
  receivedAt: Date
}, { timestamps: true });


const ReturnRequest = mongoose.model('ReturnRequest', returnRequestSchema);



export default ReturnRequest;
