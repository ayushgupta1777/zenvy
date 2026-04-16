import express from 'express';
import Address from '../models/Address.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import {
  getProfile,
  updateProfile,
  changePassword
} from '../controllers/userController.js';

const router = express.Router();

/**
 * @desc    Get profile
 * @route   GET /api/users/profile
 * @access  Private
 */
router.get('/profile', protect, getProfile);

/**
 * @desc    Update profile
 * @route   PUT /api/users/update-profile
 * @access  Private
 */
router.put('/update-profile', protect, updateProfile);

/**
 * @desc    Change password
 * @route   PUT /api/users/change-password
 * @access  Private
 */
router.put('/change-password', protect, changePassword);

/**
 * @desc    Get user addresses
 * @route   GET /api/users/addresses
 * @access  Private
 */
router.get('/addresses', protect, async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user.id }).sort('-isDefault');
    res.json({ success: true, data: { addresses } });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Add new address
 * @route   POST /api/users/addresses
 * @access  Private
 */
router.post('/addresses', protect, async (req, res, next) => {
  try {
    const address = await Address.create({
      ...req.body,
      user: req.user.id
    });
    
    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: { address }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Update address
 * @route   PUT /api/users/addresses/:id
 * @access  Private
 */
router.put('/addresses/:id', protect, async (req, res, next) => {
  try {
    let address = await Address.findById(req.params.id);
    
    if (!address) {
      return next(new AppError('Address not found', 404));
    }

    if (address.user.toString() !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    address = await Address.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: { address }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Delete address
 * @route   DELETE /api/users/addresses/:id
 * @access  Private
 */
router.delete('/addresses/:id', protect, async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id);
    
    if (!address) {
      return next(new AppError('Address not found', 404));
    }

    if (address.user.toString() !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    await address.deleteOne();

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;