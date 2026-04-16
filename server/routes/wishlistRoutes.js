import express from 'express';
import { protect } from '../middleware/auth.js';
import Wishlist from '../models/Wishlist.js';
import { AppError } from '../middleware/errorHandler.js';



const router = express.Router();

// Get my wishlist
router.get('/', protect, async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate('products', 'title price images stock averageRating');

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, products: [] });
    }

    res.json({
      success: true,
      data: { products: wishlist.products }
    });
  } catch (error) {
    next(error);
  }
});

// Add to wishlist
router.post('/', protect, async (req, res, next) => {
  try {
    const { productId } = req.body;

    let wishlist = await Wishlist.findOne({ user: req.user.id });
    
    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user.id,
        products: [productId]
      });
    } else {
      if (!wishlist.products.includes(productId)) {
        wishlist.products.push(productId);
        await wishlist.save();
      }
    }

    await wishlist.populate('products', 'title price images stock averageRating');

    res.json({
      success: true,
      message: 'Added to wishlist',
      data: { products: wishlist.products }
    });
  } catch (error) {
    next(error);
  }
});

// Remove from wishlist
router.delete('/:productId', protect, async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    
    if (!wishlist) {
      return next(new AppError('Wishlist not found', 404));
    }

    wishlist.products = wishlist.products.filter(
      p => p.toString() !== req.params.productId
    );
    await wishlist.save();
    await wishlist.populate('products', 'title price images stock averageRating');

    res.json({
      success: true,
      message: 'Removed from wishlist',
      data: { products: wishlist.products }
    });
  } catch (error) {
    next(error);
  }
});

export default router;