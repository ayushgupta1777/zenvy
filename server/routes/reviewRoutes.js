// ============================================
// 2. REVIEWS ROUTES
// backend/routes/reviewRoutes.js
// ============================================
import express from 'express';
import { protect } from '../middleware/auth.js';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { AppError } from '../middleware/errorHandler.js';
import mongoose from 'mongoose';

const router = express.Router();

// Get product reviews
router.get('/product/:productId', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, rating } = req.query;
    const skip = (page - 1) * limit;

    const query = { product: req.params.productId };
    if (rating) query.rating = parseInt(rating);

    const reviews = await Review.find(query)
      .populate('user', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(query);

    // Get rating distribution
    const distribution = await Review.aggregate([
  {
    $match: {
      product: mongoose.Types.ObjectId.createFromHexString(
        req.params.productId
      )
    }
  },
  {
    $group: {
      _id: '$rating',
      count: { $sum: 1 }
    }
  },
  {
    $sort: { _id: -1 }
  }
]);


    res.json({
      success: true,
      data: {
        reviews,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        distribution
      }
    });
  } catch (error) {
    next(error);
  }
});

// Create/Update review
router.post('/', protect, async (req, res, next) => {
  try {
    const { productId, rating, title, comment, orderId } = req.body;

    // Validate
    if (!rating || !comment) {
      return next(new AppError('Rating and comment are required', 400));
    }

    // Check if user purchased this product
    let verified = false;
    if (orderId) {
      const order = await Order.findOne({
        _id: orderId,
        user: req.user.id,
        orderStatus: 'delivered',
        'items.product': productId
      });
      verified = !!order;
    }

    // Create or update review
    let review = await Review.findOne({ 
      product: productId, 
      user: req.user.id 
    });
    
    if (review) {
      // Update existing
      review.rating = rating;
      review.title = title;
      review.comment = comment;
      review.verified = verified;
      await review.save();
    } else {
      // Create new
      review = await Review.create({
        product: productId,
        user: req.user.id,
        order: orderId,
        rating,
        title,
        comment,
        verified
      });
    }

    // Update product average rating
    const stats = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },

      { 
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        averageRating: Math.round(stats[0].avgRating * 10) / 10,
        totalReviews: stats[0].totalReviews
      });
    }

    await review.populate('user', 'name');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: { review }
    });
  } catch (error) {
    next(error);
  }
});

// Delete review
router.delete('/:reviewId', protect, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return next(new AppError('Review not found', 404));
    }

    if (review.user.toString() !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    const productId = review.product;
    await review.deleteOne();

    // Update product stats
    const stats = await Review.aggregate([
      { $match: { product: productId } },
      { 
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    await Product.findByIdAndUpdate(productId, {
      averageRating: stats[0]?.avgRating || 0,
      totalReviews: stats[0]?.totalReviews || 0
    });

    res.json({ 
      success: true, 
      message: 'Review deleted successfully' 
    });
  } catch (error) {
    next(error);
  }
});

export default router;