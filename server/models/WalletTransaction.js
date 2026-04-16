// ============================================
// backend/models/WalletTransaction.js
// ============================================
import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema({
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  source: {
    type: String,
    enum: ['resell_earning', 'withdrawal', 'refund', 'admin_adjustment', 'reversal'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  description: String,
  referenceId: String, // Order ID, Withdrawal ID, etc.
  referenceModel: String, // 'Order', 'Withdrawal', etc.
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  }
}, { timestamps: true });

const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema);
export default WalletTransaction;