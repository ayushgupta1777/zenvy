import Product from '../models/Product.js';
import { AppError } from '../middleware/errorHandler.js';

export const getAllProducts = async (req, res, next) => {
  try {
    const { status, search, category, subcategory, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status && status !== 'all') query.status = status;
    if (category && category !== 'all') query.category = category;
    if (subcategory && subcategory !== 'all') query.subcategory = subcategory;

    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { sku: new RegExp(search, 'i') }
      ];

      // If search is a valid MongoDB ID, add it to $or
      if (search.match(/^[0-9a-fA-F]{24}$/)) {
        query.$or.push({ _id: search });
      }
    }

    const skip = (page - 1) * limit;
    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('vendor', 'storeName')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    if (req.body.isFeatured) {
      const featuredCount = await Product.countDocuments({ isFeatured: true });
      if (featuredCount >= 5) {
        return next(new AppError('Maximum of 5 featured products allowed', 400));
      }
    }

    const sku = req.body.sku || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const product = await Product.create({
      ...req.body,
      sku,
      status: 'approved'
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    if (req.body.isFeatured) {
      const existingProduct = await Product.findById(req.params.id);
      if (existingProduct && !existingProduct.isFeatured) {
        const featuredCount = await Product.countDocuments({ isFeatured: true });
        if (featuredCount >= 5) {
          return next(new AppError('Maximum of 5 featured products allowed', 400));
        }
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const toggleProductStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Product status updated',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};
export const toggleProductFeatured = async (req, res, next) => {
  try {
    const { isFeatured } = req.body;
    
    if (isFeatured) {
      const featuredCount = await Product.countDocuments({ isFeatured: true });
      if (featuredCount >= 5) {
        return next(new AppError('Maximum of 5 featured products allowed', 400));
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isFeatured },
      { new: true }
    );

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    res.json({
      success: true,
      message: `Product ${isFeatured ? 'pinned to' : 'removed from'} featured`,
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};
