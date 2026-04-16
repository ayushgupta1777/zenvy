import express from 'express';
import {
  globalSearch,
  searchByCategory,
  getSubcategoriesByParent,
  getSearchSuggestions
} from '../controllers/searchController.js';

const router = express.Router();

// Global search (products + categories + subcategories)
router.get('/', globalSearch);

// Search suggestions
router.get('/suggestions', getSearchSuggestions);

// Get products by category/subcategory
router.get('/category/:categoryId', searchByCategory);

// Get subcategories by parent
router.get('/category/:parentId/subcategories', getSubcategoriesByParent);

export default router;