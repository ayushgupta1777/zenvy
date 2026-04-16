import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { AppError } from '../middleware/errorHandler.js';

import User from '../models/User.js';

export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'title images price mrp stock');

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    res.json({ success: true, data: { cart } });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, resellPrice = 0 } = req.body;

    // Validate reseller status if margin is provided
    if (resellPrice > 0) {
      const user = await User.findById(req.user.id);
      const isReseller = user?.resellerApplication?.status === 'approved';
      if (!isReseller) {
        return next(new AppError('Only approved resellers can add a resell margin', 403));
      }
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return next(new AppError('Product not available', 404));
    }

    if (product.stock < quantity) {
      return next(new AppError(`Only ${product.stock} available`, 400));
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    const basePrice = product.price;
    const finalPrice = basePrice + parseFloat(resellPrice || 0);

    const existingIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
      cart.items[existingIndex].basePrice = basePrice;
      cart.items[existingIndex].resellPrice = resellPrice || 0;
      cart.items[existingIndex].finalPrice = finalPrice;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        basePrice,
        resellPrice: resellPrice || 0,
        finalPrice
      });
    }

    await cart.save();
    await cart.populate('items.product', 'title images');

    res.json({ success: true, message: 'Added to cart', data: { cart } });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity, resellPrice } = req.body;

    // Validate reseller status if margin is modified
    if (resellPrice !== undefined && resellPrice > 0) {
      const user = await User.findById(req.user.id);
      const isReseller = user?.resellerApplication?.status === 'approved';
      if (!isReseller) {
        return next(new AppError('Only approved resellers can set a resell margin', 403));
      }
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return next(new AppError('Cart not found', 404));

    const item = cart.items.id(itemId);
    if (!item) return next(new AppError('Item not found', 404));

    if (quantity) item.quantity = quantity;
    
    if (resellPrice !== undefined) {
      item.resellPrice = resellPrice;
      item.finalPrice = item.basePrice + resellPrice;
    }

    await cart.save();
    await cart.populate('items.product', 'title images');

    res.json({ success: true, message: 'Updated', data: { cart } });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return next(new AppError('Cart not found', 404));

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();
    await cart.populate('items.product', 'title images');

    res.json({ success: true, message: 'Removed', data: { cart } });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      cart.totalPrice = 0;
      await cart.save();
    }

    res.json({
      success: true,
      message: 'Cart cleared',
      data: { items: [], totalPrice: 0 }
    });
  } catch (error) {
    next(error);
  }
};

export const updateResellPrice = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { resellPrice } = req.body;

    // Validate user is reseller
    const user = await User.findById(req.user.id);
    const isReseller = user.resellerApplication?.status === 'approved';

    if (!isReseller) {
      return next(new AppError('Only approved resellers can set resell price', 403));
    }

    if (resellPrice < 0) {
      return next(new AppError('Resell price cannot be negative', 400));
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return next(new AppError('Cart not found', 404));
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return next(new AppError('Item not found in cart', 404));
    }

    // Update resell price
    item.resellPrice = resellPrice;
    item.finalPrice = item.basePrice + resellPrice;
    
    if (resellPrice > 0) {
      item.reseller = req.user.id;
    } else {
      item.reseller = null;
    }

    await cart.save();

    // Populate and return updated cart
    await cart.populate({
      path: 'items.product',
      select: 'title images price mrp stock'
    });

    res.json({
      success: true,
      message: 'Resell price updated',
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
};

