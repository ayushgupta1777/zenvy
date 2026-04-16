import Coupon from '../models/Coupon.js';
import { AppError } from '../middleware/errorHandler.js';

// Admin: Create Coupon
export const createCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Coupon created successfully',
            data: { coupon }
        });
    } catch (error) {
        if (error.code === 11000) {
            return next(new AppError('Coupon code already exists', 400));
        }
        next(error);
    }
};

// Admin: Get all coupons
export const getAllCoupons = async (req, res, next) => {
    try {
        const coupons = await Coupon.find().sort('-createdAt');
        res.json({
            success: true,
            data: { coupons }
        });
    } catch (error) {
        next(error);
    }
};

// Admin: Update Coupon
export const updateCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!coupon) return next(new AppError('Coupon not found', 404));

        res.json({
            success: true,
            message: 'Coupon updated successfully',
            data: { coupon }
        });
    } catch (error) {
        next(error);
    }
};

// Admin: Delete Coupon
export const deleteCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!coupon) return next(new AppError('Coupon not found', 404));

        res.json({
            success: true,
            message: 'Coupon deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// User: Validate Coupon
export const validateCoupon = async (req, res, next) => {
    try {
        const { code, orderAmount } = req.body;
        if (!code) return next(new AppError('Coupon code is required', 400));

        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

        if (!coupon) {
            return next(new AppError('Invalid or expired coupon code', 404));
        }

        // Check expiry
        if (new Date(coupon.expiryDate) < new Date()) {
            return next(new AppError('This coupon has expired', 400));
        }

        // Check usage limit
        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
            return next(new AppError('Coupon usage limit reached', 400));
        }

        // Check minimum order amount
        if (orderAmount < coupon.minOrderAmount) {
            return next(new AppError(`Minimum order amount for this coupon is ₹${coupon.minOrderAmount}`, 400));
        }

        // Check per-user limit
        const userUsage = coupon.usersUsed.find(u => u.user.toString() === req.user.id);
        if (userUsage && userUsage.count >= coupon.perUserLimit) {
            return next(new AppError('You have already used this coupon', 400));
        }

        // Calculate discount
        let discount = 0;
        if (coupon.discountType === 'percentage') {
            discount = (orderAmount * coupon.discountAmount) / 100;
            if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
                discount = coupon.maxDiscountAmount;
            }
        } else {
            discount = coupon.discountAmount;
        }

        // Ensure discount doesn't exceed order amount
        if (discount > orderAmount) {
            discount = orderAmount;
        }

        res.json({
            success: true,
            data: {
                code: coupon.code,
                discountType: coupon.discountType,
                discountAmount: coupon.discountAmount,
                appliedDiscount: Math.round(discount),
                minOrderAmount: coupon.minOrderAmount
            }
        });
    } catch (error) {
        next(error);
    }
};

export default {
    createCoupon,
    getAllCoupons,
    updateCoupon,
    deleteCoupon,
    validateCoupon
};
