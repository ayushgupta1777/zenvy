// ============================================
// backend/models/User.js
// ============================================
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    sparse: true // Allows multiple null/undefined values
  },
  phone: {
    type: String,
    sparse: true,
    trim: true
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  password: {
    type: String,
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['customer', 'vendor', 'reseller', 'admin', 'delivery_agent', 'developer'],
    default: 'customer'
  },

  // ADD to your User schema:
  resellerApplication: {
    status: {
      type: String,
      enum: ['none', 'approved'],
      default: 'none'
    },
    appliedAt: Date,
    approvedAt: Date,
    businessName: String,
    accountHolderName: String,
    accountNumber: String,
    bankName: String,
    ifscCode: String
  },

  paymentMethods: {
    upiId: { type: String, trim: true },
    bankName: { type: String, trim: true },
    accountHolderName: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    ifscCode: { type: String, trim: true }
  },

  avatar: String,
  profileImage: String,
  emailVerified: {
    type: Boolean,
    default: false
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: Date,
  fcmToken: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT) || 10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON response
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
