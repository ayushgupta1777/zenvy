import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Vendor from '../models/Vendor.js';
import Reseller from '../models/Reseller.js';
import Wallet from '../models/Wallet.js';
import OTP from '../models/OTP.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateReferralCode } from '../utils/helpers.js';
import { sendOTP_2Factor } from '../utils/sms.js';

/**
 * Generate JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// OTP Methods Removed

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, googleId, profileImage, phone, password, phoneNumber, role } = req.body;
    
    // Support both phone and phoneNumber
    const actualPhone = phone || phoneNumber;

    if (!email) {
      return next(new AppError('Email is required', 400));
    }

    let user = await User.findOne({ email });

    if (user) {
      // User exists, update missing fields if needed
      let updated = false;
      if (googleId && !user.googleId) { user.googleId = googleId; updated = true; }
      if (profileImage && !user.profileImage) { user.profileImage = profileImage; updated = true; }
      if (actualPhone && !user.phone) { user.phone = actualPhone; updated = true; }
      if (password && !user.password) { user.password = password; updated = true; }

      if (updated) {
        await user.save();
      }
    } else {
      // Check if phone exists on another account
      if (actualPhone) {
        const phoneExists = await User.findOne({ phone: actualPhone });
        if (phoneExists) {
          return next(new AppError('Phone number already registered with a different account', 400));
        }
      }

      // Create new user
      user = await User.create({
        name,
        email,
        googleId: googleId || undefined,
        profileImage: profileImage || undefined,
        password: password || undefined,
        phone: actualPhone || undefined,
        role: role || 'customer',
        emailVerified: !!googleId // If from google, email is verified
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profileImage: user.profileImage
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password, googleId } = req.body;

    if (!email) {
      return next(new AppError('Email is required', 400));
    }

    let user;

    if (googleId) {
      // Option 1: Google Login
      // Find by email instead of just googleId to ensure email matches
      user = await User.findOne({ email });
      
      if (!user) {
        return next(new AppError('User not found. Please sign up first.', 404));
      }

      // If user exists but no googleId is linked, link it now
      if (!user.googleId) {
        user.googleId = googleId;
        user.emailVerified = true;
        await user.save();
      }
    } else if (password) {
      // Option 2: Email + Password Login
      user = await User.findOne({ email }).select('+password');
      if (!user) return next(new AppError('Invalid credentials', 401));

      if (!user.password) {
        return next(new AppError('Please continue with Google or reset your password to login.', 401));
      }

      const isPasswordMatch = await user.comparePassword(password);
      if (!isPasswordMatch) return next(new AppError('Invalid credentials', 401));
    } else {
      return next(new AppError('Please provide password or continue with Google', 400));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new AppError('Account is deactivated', 401));
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
          profileImage: user.profileImage,
          resellerApplication: user.resellerApplication
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return next(new AppError('User not found', 404));

    let profile = { user };

    // Get vendor details if user is vendor
    if (user.role === 'vendor') {
      const vendor = await Vendor.findOne({ user: user._id });
      profile.vendor = vendor;
    }

    // Get reseller details if user is reseller
    if (user.role === 'reseller') {
      const reseller = await Reseller.findOne({ user: user._id }).populate('wallet');
      profile.reseller = reseller;
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar, email } = req.body;

    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    if (email) user.email = email;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/password
 * @access  Private
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    if (!user.password && newPassword) {
      // For users who joined via OTP and want to set a password
      user.password = newPassword;
      await user.save();
      return res.json({ success: true, message: 'Password set successfully' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return next(new AppError('Current password is incorrect', 400));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};
