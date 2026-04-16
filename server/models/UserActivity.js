import mongoose from 'mongoose';

const userActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  screen: {
    type: String,
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  productTitle: String, // Store for quick access
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: Object // Store device info, etc.
}, {
  timestamps: true
});

// Index for quick queries
userActivitySchema.index({ user: 1, timestamp: -1 });

const UserActivity = mongoose.model('UserActivity', userActivitySchema);
export default UserActivity;
