import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  lastMessage: {
    type: String,
    default: '',
  },
  unreadCountUser: {
    type: Number,
    default: 0,
  },
  unreadCountAdmin: {
    type: Number,
    default: 0,
  },
  lastOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: false,
  },
  status: {
    type: String,
    enum: ['active', 'resolved'],
    default: 'active',
  },
}, { timestamps: true });

export default mongoose.model('Chat', chatSchema);
