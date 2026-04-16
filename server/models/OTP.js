import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    trim: true
  },
  otp: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['verification', 'signup', 'login'],
    default: 'verification'
  },
  expiresAt: {
    type: Date,
    required: true,
    expires: 0 // Automatically delete the document when expiresAt is reached
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Optionally, you could hash the OTP, but since it's short-lived, plain text might be acceptable depending on requirements.
// If hashing is required, it can be added here similar to the User model.

const OTP = mongoose.model('OTP', otpSchema);
export default OTP;
