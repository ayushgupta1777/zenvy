import { body, validationResult } from 'express-validator';

/**
 * Handle validation errors
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

/**
 * Register validation rules
 */
export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().isLength({ min: 10, max: 15 }).withMessage('Valid phone number is required'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('googleId').optional().isString().withMessage('invalid google ID'),
  body('profileImage').optional().isString().withMessage('invalid profile image URL'),
  body('role').optional().isIn(['customer', 'vendor', 'reseller']).withMessage('Invalid role')
];

/**
 * Login validation rules
 */
export const loginValidation = [
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('googleId').optional().isString().withMessage('Google ID must be a string'),
  body('password').optional().notEmpty().withMessage('Password is required'),
];

/**
 * Product validation rules
 */
export const productValidation = [
  body('title').trim().notEmpty().withMessage('Product title is required'),
  body('description').trim().notEmpty().withMessage('Product description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('mrp').isFloat({ min: 0 }).withMessage('MRP must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a positive number'),
  body('category').notEmpty().withMessage('Category is required')
];

/**
 * Order validation rules
 * NOTE: Items are NOT validated here because they come from the user's cart in the database,
 * not from the request body. The cart is fetched and validated in the controller.
 */
export const orderValidation = [
  // REMOVED: body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  // Items come from cart in database, validated in controller

  body('shippingAddress').notEmpty().withMessage('Shipping address is required'),
  body('shippingAddress.name').trim().notEmpty().withMessage('Recipient name is required'),
  body('shippingAddress.phone').trim().notEmpty().withMessage('Phone number is required')
    .isLength({ min: 10, max: 15 }).withMessage('Phone number must be between 10-15 digits'),
  body('shippingAddress.addressLine1').trim().notEmpty().withMessage('Address line 1 is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
  body('shippingAddress.state').trim().notEmpty().withMessage('State is required'),
  body('shippingAddress.pincode').trim().notEmpty().withMessage('Pincode is required')
    .isLength({ min: 5, max: 10 }).withMessage('Pincode must be between 5-10 characters'),
  body('paymentMethod').isIn(['cod', 'online', 'upi', 'card']).withMessage('Invalid payment method')
];