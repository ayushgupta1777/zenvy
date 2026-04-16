// ============================================
// backend/models/Reseller.js
// ============================================
import mongoose from 'mongoose';

const resellerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  storeName: {
    type: String,
    trim: true
  },
  referralCode: {
    type: String,
    unique: true,
    required: true
  },
  defaultMargin: {
    type: Number,
    min: parseFloat(process.env.MIN_RESELLER_MARGIN) || 5,
    max: parseFloat(process.env.MAX_RESELLER_MARGIN) || 30,
    default: 10
  },
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet'
  },
  totalSales: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  kycStatus: {
    type: String,
    enum: ['not_submitted', 'pending', 'approved', 'rejected'],
    default: 'not_submitted'
  },
  kycDocuments: {
    aadhar: String,
    pan: String
  }
}, {
  timestamps: true
});

const Reseller = mongoose.model('Reseller', resellerSchema);
export default Reseller;