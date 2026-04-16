// ============================================
// backend/controllers/searchController.js
// UPDATED - With Subcategory Support
// ============================================
import Product from '../models/Product.js';
import Category from '../models/Category.js';

/**
 * Generate a fuzzy regex pattern to allow small typos (Levenshtein approx).
 * Example: 'ring' -> allowed to match 'rng', 'riing', 'rinng' up to a short distance.
 */
const createFuzzyRegex = (query) => {
  const chars = query.split('');
  // Build a generic fuzzy pattern inserting optional characters and allowing one swap
  // For 'ring', it creates a regex that matches slightly perturbed variations.
  const fuzzyLogic = chars.map((char, index) => {
    // Escape regex characters just in case
    const c = char.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    return `${c}?`;
  }).join('.??'); // Allow up to 2 random characters between letters

  // We wrap the fuzzy pattern to match anywhere in the word, case insensitive
  return new RegExp(fuzzyLogic, 'i');
};

/**
 * @desc    Global search - Products, Categories, and Subcategories
 * @route   GET /api/search
 * @access  Public
 */
export const globalSearch = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.json({
        success: true,
        data: {
          products: [],
          categories: [],
          subcategories: []
        }
      });
    }

    const trimmedQuery = query.trim();
    // 1. Precise Indexed Match (Scale First)
    const exactWordRegex = new RegExp(`\\b${trimmedQuery}\\b`, 'i');
    const partialMatchRegex = new RegExp(trimmedQuery, 'i');

    // First Pass: Attempt to use MongoDB's incredibly fast `$text` index.
    let products = await Product.find({
      $text: { $search: trimmedQuery },
      status: 'approved',
      isActive: true
    })
      .populate('category', 'name slug image')
      .populate('subcategory', 'name slug image parent')
      .sort({ score: { $meta: 'textScore' } }) // Rank by relevance!
      .limit(20)
      .lean();

    // Second Pass (Fallback): If indexed Text search yielded too few results,
    // we drop back to partial regex and fuzzy matching (typo tolerance).
    if (products.length < 5) {
      const fuzzyRegex = createFuzzyRegex(trimmedQuery);

      const fallbackProducts = await Product.find({
        $or: [
          { title: partialMatchRegex },
          { keywords: { $in: [partialMatchRegex] } },
          { title: fuzzyRegex } // Typo tolerance Catch-all
        ],
        status: 'approved',
        isActive: true,
        _id: { $nin: products.map(p => p._id) } // Exclude already found items
      })
        .populate('category', 'name slug image')
        .populate('subcategory', 'name slug image parent')
        .limit(20 - products.length)
        .lean();

      products = [...products, ...fallbackProducts];
    }

    // Search all categories (both parent and subcategories) using Prefix (Faster) or Partial
    const allCategories = await Category.find({
      name: partialMatchRegex,
      isActive: true
    })
      .populate('parent', 'name slug image')
      .limit(20)
      .lean();

    // Separate root categories and subcategories
    const categories = allCategories.filter(cat => !cat.parent);
    const subcategories = allCategories.filter(cat => cat.parent);

    res.json({
      success: true,
      data: {
        products,
        categories,
        subcategories,
        query: trimmedQuery
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get search suggestions for autocomplete
 * @route   GET /api/search/suggestions
 * @access  Public
 */
export const getSearchSuggestions = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.json({ success: true, data: [] });
    }

    const trimmedQuery = query.trim();
    const searchRegex = new RegExp(`^${trimmedQuery}`, 'i'); // Starts with

    const [productTitles, categoryNames] = await Promise.all([
      Product.find({
        title: searchRegex,
        status: 'approved',
        isActive: true
      })
        .select('title')
        .limit(5)
        .lean(),

      Category.find({
        name: searchRegex,
        isActive: true
      })
        .select('name')
        .limit(5)
        .lean()
    ]);

    const suggestions = [
      ...productTitles.map(p => ({ text: p.title, type: 'product' })),
      ...categoryNames.map(c => ({ text: c.name, type: 'category' }))
    ];

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get products by category/subcategory from search
 * @route   GET /api/search/category/:categoryId
 * @access  Public
 */
export const searchByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.json({
        success: true,
        data: { products: [], category: null, subcategories: [] }
      });
    }

    let query = { status: 'approved', isActive: true };

    // If it's a parent category, show all products in it and subcategories
    if (!category.parent) {
      const subcats = await Category.find({ parent: categoryId });
      const subcatIds = subcats.map(cat => cat._id);
      query.$or = [
        { category: categoryId },
        { subcategory: { $in: subcatIds } }
      ];
    } else {
      // If it's a subcategory, show only its products
      query.subcategory = categoryId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug image')
        .populate('subcategory', 'name slug image')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit)),

      Product.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        category,
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
 * @desc    Get subcategories by parent category
 * @route   GET /api/search/category/:parentId/subcategories
 * @access  Public
 */
export const getSubcategoriesByParent = async (req, res, next) => {
  try {
    const { parentId } = req.params;

    const subcategories = await Category.find({
      parent: parentId,
      isActive: true
    })
      .populate('parent', 'name slug image')
      .sort('sortOrder');

    res.json({
      success: true,
      data: { subcategories }
    });
  } catch (error) {
    next(error);
  }
};