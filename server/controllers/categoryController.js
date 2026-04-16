// ============================================
// backend/controllers/categoryController.js
// MISSING CONTROLLER - Category management
// ============================================
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
export const getCategories = async (req, res, next) => {
  try {
    const { parent } = req.query;
    
    const query = { isActive: true };
    if (parent) {
      if (parent === 'all') {
        // Do nothing, return all active categories
      } else {
        query.parent = parent;
      }
    } else {
      // Default to root categories only if requested, otherwise return all
      // The user wants ALL categories for the filter
      // query.parent = null; 
    }

    const categories = await Category.find(query)
      .populate('parent', 'name slug')
      .sort('sortOrder');

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single category with products
 * @route   GET /api/categories/:id
 * @access  Public
 */
export const getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parent', 'name slug')
      .populate('children');

    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    // Get products in this category
    const products = await Product.find({
      category: category._id,
      status: 'approved',
      isActive: true
    }).limit(20);

    res.json({
      success: true,
      data: {
        category,
        products
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create category (Admin only)
 * @route   POST /api/categories
 * @access  Private (Admin)
 */
export const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, image, parent, parentId, sortOrder } = req.body;

    // Check if slug already exists
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return next(new AppError('Category with this slug already exists', 400));
    }

    // Use parent if provided, otherwise use parentId (for backward compatibility)
    const parentValue = parent || parentId || null;

    const category = await Category.create({
      name,
      slug,
      description,
      image,
      parent: parentValue,
      sortOrder
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update category (Admin only)
 * @route   PUT /api/categories/:id
 * @access  Private (Admin)
 */
export const updateCategory = async (req, res, next) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete category (Admin only)
 * @route   DELETE /api/categories/:id
 * @access  Private (Admin)
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    // Check if category has products
    const productsCount = await Product.countDocuments({ category: category._id });
    if (productsCount > 0) {
      return next(new AppError('Cannot delete category with products', 400));
    }

    await category.deleteOne();

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get category tree (hierarchical)
 * @route   GET /api/categories/tree
 * @access  Public
 */
export const getCategoryTree = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort('sortOrder');

    // Build tree structure
    const categoryMap = {};
    const tree = [];

    // First pass: create map
    categories.forEach(cat => {
      categoryMap[cat._id] = { ...cat.toObject(), children: [] };
    });

    // Second pass: build tree
    categories.forEach(cat => {
      if (cat.parent) {
        if (categoryMap[cat.parent]) {
          categoryMap[cat.parent].children.push(categoryMap[cat._id]);
        }
      } else {
        tree.push(categoryMap[cat._id]);
      }
    });

    res.json({
      success: true,
      data: { categories: tree }
    });
  } catch (error) {
    next(error);
  }
};
/**
 * @desc    Get subcategories by parent category
 * @route   GET /api/categories/:parentId/subcategories
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
      data: subcategories
    });
  } catch (error) {
    next(error);
  }
};
