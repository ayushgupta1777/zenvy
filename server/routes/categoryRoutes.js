// ============================================
// backend/routes/categoryRoutes.js
// MISSING ROUTES - Category routes
// ============================================
import express from 'express';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree,
  getSubcategoriesByParent
} from '../controllers/categoryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/tree', getCategoryTree);
router.get('/:id', getCategory);
router.get('/:parentId/subcategories', getSubcategoriesByParent);

// Admin routes
router.post('/', protect, authorize('admin'), createCategory);
router.put('/:id', protect, authorize('admin'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

export default router;
