// ============================================
// backend/controllers/productController.js
// UPDATED - With Subcategory Support
// ============================================
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Vendor from '../models/Vendor.js';
import { AppError } from '../middleware/errorHandler.js';
import Category from '../models/Category.js';

/**
 * @desc    Get all products with filters including subcategories
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      subcategory,
      minPrice,
      maxPrice,
      sort = '-createdAt',
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query = { status: 'approved', isActive: true };

    // Search in title, description and keywords using text index
    if (search) {
      const trimmedSearch = search.trim();
      query.$or = [
        { $text: { $search: trimmedSearch } },
        { title: { $regex: trimmedSearch, $options: 'i' } },
        { keywords: { $in: [new RegExp(trimmedSearch, 'i')] } }
      ];
    }

    // Filter by subcategory (priority over category)
    if (subcategory) {
      if (mongoose.Types.ObjectId.isValid(subcategory)) {
        query.subcategory = subcategory;
      } else {
        const subCategoryDoc = await Category.findOne({
          slug: subcategory.toLowerCase()
        });

        if (subCategoryDoc) {
          query.subcategory = subCategoryDoc._id;
        } else {
          return res.json({
            success: true,
            data: {
              products: [],
              pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: 0,
                pages: 0
              }
            },
            message: 'Subcategory not found'
          });
        }
      }
    }
    // Filter by parent category (if no subcategory specified)
    else if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        // Find all subcategories under this parent
        const subCategories = await Category.find({ parent: category });
        const subCategoryIds = subCategories.map(cat => cat._id);

        // Include products from parent category AND its subcategories
        query.$or = [
          { category: category },
          { subcategory: { $in: subCategoryIds } }
        ];
      } else {
        const categoryDoc = await Category.findOne({
          slug: category.toLowerCase()
        });

        if (categoryDoc) {
          const subCategories = await Category.find({ parent: categoryDoc._id });
          const subCategoryIds = subCategories.map(cat => cat._id);

          query.$or = [
            { category: categoryDoc._id },
            { subcategory: { $in: subCategoryIds } }
          ];
        } else {
          return res.json({
            success: true,
            data: {
              products: [],
              pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: 0,
                pages: 0
              }
            },
            message: 'Category not found'
          });
        }
      }
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const products = await Product.find(query)
      .populate('category', 'name slug image')
      .populate('subcategory', 'name slug image parent')
      .populate('vendor', 'storeName')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug image')
      .populate('subcategory', 'name slug image parent')
      .populate('vendor', 'storeName storeLogo');

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    // Increment view count
    product.viewCount += 1;
    await product.save();

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create product (Vendor/Admin)
 * @route   POST /api/products
 * @access  Private (Vendor/Admin)
 */
export const createProduct = async (req, res, next) => {
  try {
    const { category, subcategory } = req.body;

    // Validate that either category or subcategory is provided
    if (!category && !subcategory) {
      return next(new AppError('Category or Subcategory is required', 400));
    }

    // If subcategory is provided, validate it exists and get its parent
    let finalCategory = category;
    let finalSubcategory = subcategory;

    if (subcategory) {
      const subCat = await Category.findById(subcategory);
      if (!subCat) {
        return next(new AppError('Subcategory not found', 404));
      }
      // Use subcategory's parent as the main category
      finalCategory = subCat.parent;
      finalSubcategory = subcategory;
    }

    // Get vendor profile (if vendor creating)
    let vendorId = null;
    if (req.user.role === 'vendor') {
      const vendor = await Vendor.findOne({ user: req.user.id });
      if (!vendor) {
        return next(new AppError('Vendor profile not found', 404));
      }
      if (vendor.status !== 'approved') {
        return next(new AppError('Your vendor account is not approved yet', 403));
      }
      vendorId = vendor._id;
    }

    // Generate SKU
    const sku = req.body.sku || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const productData = {
      ...req.body,
      category: finalCategory,
      subcategory: finalSubcategory,
      sku,
      status: req.user.role === 'admin' ? 'approved' : 'pending'
    };

    if (vendorId) {
      productData.vendor = vendorId;
    }

    const product = await Product.create(productData);

    // Update vendor's product count
    if (vendorId) {
      const vendor = await Vendor.findById(vendorId);
      vendor.totalProducts += 1;
      await vendor.save();
    }

    res.status(201).json({
      success: true,
      message: req.user.role === 'admin'
        ? 'Product created successfully'
        : 'Product created successfully. Pending admin approval.',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private (Vendor/Admin)
 */
export const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    // Check authorization (vendor can only update their own)
    if (req.user.role === 'vendor') {
      const vendor = await Vendor.findOne({ user: req.user.id });
      if (product.vendor.toString() !== vendor._id.toString()) {
        return next(new AppError('Not authorized to update this product', 403));
      }
    }

    // Handle subcategory update
    if (req.body.subcategory) {
      const subCat = await Category.findById(req.body.subcategory);
      if (!subCat) {
        return next(new AppError('Subcategory not found', 404));
      }
      req.body.category = subCat.parent;
    }

    // Update product
    product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private (Vendor/Admin)
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    // Check authorization
    if (req.user.role === 'vendor') {
      const vendor = await Vendor.findOne({ user: req.user.id });
      if (product.vendor.toString() !== vendor._id.toString()) {
        return next(new AppError('Not authorized to delete this product', 403));
      }
    }

    await product.deleteOne();

    // Update vendor's product count
    if (product.vendor) {
      const vendor = await Vendor.findById(product.vendor);
      if (vendor) {
        vendor.totalProducts -= 1;
        await vendor.save();
      }
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get vendor's own products
 * @route   GET /api/products/vendor/my-products
 * @access  Private (Vendor)
 */
export const getVendorProducts = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return next(new AppError('Vendor profile not found', 404));
    }

    const products = await Product.find({ vendor: vendor._id })
      .populate('category', 'name')
      .populate('subcategory', 'name')
      .sort('-createdAt');

    res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get subcategories by parent category
 * @route   GET /api/products/categories/:parentId/subcategories
 * @access  Public
 */
export const getSubcategoriesByParent = async (req, res, next) => {
  try {
    const { parentId } = req.params;

    const subcategories = await Category.find({
      parent: parentId,
      isActive: true
    }).sort('sortOrder');

    res.json({
      success: true,
      data: { subcategories }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get featured products
 * @route   GET /api/products/featured
 * @access  Public
 */
export const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true, status: 'approved', isActive: true })
      .populate('category', 'name slug image')
      .populate('vendor', 'storeName')
      .limit(5);

    res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    next(error);
  }
};