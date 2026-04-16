
import mongoose from 'mongoose';
// 8. NOTIFICATION MODEL
const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'order_placed',
      'payment_success',
      'order_confirmed',
      'order_shipped',
      'order_delivered',
      'return_initiated',
      'return_approved',
      'return_rejected',
      'wallet_credited',
      'withdrawal_completed',
      'withdrawal_rejected',
      'reseller_approved',
      'reseller_rejected'
    ],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: mongoose.Schema.Types.Mixed,
  referenceId: String,
  referenceModel: String,
  channels: {
    push: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  },
  status: {
    push: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      error: String
    },
    email: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      error: String
    },
    sms: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      error: String
    }
  },
  isRead: { type: Boolean, default: false },
  readAt: Date
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;