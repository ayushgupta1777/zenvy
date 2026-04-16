// ============================================
// 3. BACKEND: Review Controller
// backend/controllers/reviewController.js
// ============================================
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

export const getProductReviews = async (req, res, next) => {
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
      { $match: { product: req.params.productId } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
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
};

export const createReview = async (req, res, next) => {
  try {
    const { productId, rating, title, comment, images, orderId } = req.body;

    // Check if user has purchased this product
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
    let review = await Review.findOne({ product: productId, user: req.user.id });
    
    if (review) {
      review.rating = rating;
      review.title = title;
      review.comment = comment;
      review.images = images || [];
      review.verified = verified;
      await review.save();
    } else {
      review = await Review.create({
        product: productId,
        user: req.user.id,
        order: orderId,
        rating,
        title,
        comment,
        images: images || [],
        verified
      });
    }

    // Update product average rating
    const stats = await Review.aggregate([
      { $match: { product: productId } },
      { $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }}
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
      message: 'Review submitted',
      data: { review }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return next(new AppError('Review not found', 404));
    }

    if (review.user.toString() !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    await review.deleteOne();

    // Update product stats
    const stats = await Review.aggregate([
      { $match: { product: review.product } },
      { $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }}
    ]);

    await Product.findByIdAndUpdate(review.product, {
      averageRating: stats[0]?.avgRating || 0,
      totalReviews: stats[0]?.totalReviews || 0
    });

    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};
