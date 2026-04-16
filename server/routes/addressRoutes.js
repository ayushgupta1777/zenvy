// ============================================
// 3. ADDRESS ROUTES (Already in userRoutes.js - but improved)
// backend/routes/addressRoutes.js
// ============================================
import express from 'express';
import { protect } from '../middleware/auth.js';
import Address from '../models/Address.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// Get all addresses
router.get('/', protect, async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user.id })
      .sort('-isDefault -createdAt');
    
    res.json({ 
      success: true, 
      data: { addresses } 
    });
  } catch (error) {
    next(error);
  }
});

// Add new address
router.post('/', protect, async (req, res, next) => {
  try {
    const { name, phone, addressLine1, addressLine2, city, state, pincode, addressType, isDefault } = req.body;

    // Validate required fields
    if (!name || !phone || !addressLine1 || !city || !state || !pincode) {
      return next(new AppError('All required fields must be filled', 400));
    }

    // If this is default, unset other defaults
    if (isDefault) {
      await Address.updateMany(
        { user: req.user.id },
        { isDefault: false }
      );
    }

    const address = await Address.create({
      user: req.user.id,
      name,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      addressType: addressType || 'home',
      isDefault: isDefault || false
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

// Update address
router.put('/:id', protect, async (req, res, next) => {
  try {
    let address = await Address.findById(req.params.id);
    
    if (!address) {
      return next(new AppError('Address not found', 404));
    }

    if (address.user.toString() !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    // If setting as default, unset others
    if (req.body.isDefault) {
      await Address.updateMany(
        { user: req.user.id, _id: { $ne: req.params.id } },
        { isDefault: false }
      );
    }

    address = await Address.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: { address }
    });
  } catch (error) {
    next(error);
  }
});

// Delete address
router.delete('/:id', protect, async (req, res, next) => {
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

// Set default address
router.put('/:id/default', protect, async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id);
    
    if (!address) {
      return next(new AppError('Address not found', 404));
    }

    if (address.user.toString() !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    // Unset all defaults
    await Address.updateMany(
      { user: req.user.id },
      { isDefault: false }
    );

    // Set this as default
    address.isDefault = true;
    await address.save();

    res.json({
      success: true,
      message: 'Default address updated',
      data: { address }
    });
  } catch (error) {
    next(error);
  }
});

export default router;