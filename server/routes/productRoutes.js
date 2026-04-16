// ============================================
// backend/routes/productRoutes.js
// UPDATED - With Subcategory Support
// ============================================
import express from 'express';
import {
  getProducts,
  getProduct,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getVendorProducts,
  getSubcategoriesByParent
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';
import { productValidation, validate } from '../middleware/validation.js';
import { uploadProduct } from '../middleware/fileUpload.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProduct);
router.get('/categories/:parentId/subcategories', getSubcategoriesByParent);

// Protected routes (Vendor/Admin)
router.use(protect);

router.get('/vendor/my-products', authorize('vendor'), getVendorProducts);

router.post('/',
  authorize('vendor', 'admin'),
  uploadProduct.array('images', 5),
  productValidation,
  validate,
  createProduct
);

router.put('/:id',
  authorize('vendor', 'admin'),
  productValidation,
  validate,
  updateProduct
);

router.delete('/:id',
  authorize('vendor', 'admin'),
  deleteProduct
);

// Image upload route
router.post('/:id/images',
  authorize('vendor', 'admin'),
  uploadProduct.array('images', 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'Please upload images' });
      }

      const imageUrls = req.files.map(file => `/uploads/products/${file.filename}`);
      res.json({
        success: true,
        data: { images: imageUrls }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export default router;