import mongoose from 'mongoose';

// 7. WITHDRAWAL REQUEST MODEL
const withdrawalSchema = new mongoose.Schema({
  withdrawalNo: { type: String, required: true, unique: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 100
  },
  bankDetails: {
    accountHolderName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true },
    bankName: { type: String, required: true },
    accountType: {
      type: String,
      enum: ['savings', 'current'],
      default: 'savings'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'rejected', 'failed'],
    default: 'pending'
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: Date,
  transactionId: String,
  utrNumber: String,
  rejectionReason: String,
  completedAt: Date
}, { timestamps: true });
const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);
export default Withdrawal;