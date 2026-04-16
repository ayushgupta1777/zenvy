// backend/routes/uploadRoutes.js
import express from 'express';
import { uploadTemp } from '../middleware/fileUpload.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @desc    Upload single image to temp folder
 * @route   POST /api/upload/image
 * @access  Private (Admin)
 */
router.post('/image', protect, authorize('admin'), uploadTemp.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload an image' });
  }

  res.json({
    success: true,
    data: {
      url: `/uploads/temp/${req.file.filename}`,
      filename: req.file.filename
    }
  });
});

/**
 * @desc    Upload multiple images to temp folder
 * @route   POST /api/upload/images
 * @access  Private (Admin)
 */
router.post('/images', protect, authorize('admin'), uploadTemp.array('images', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'Please upload images' });
  }

  const urls = req.files.map(file => `/uploads/temp/${file.filename}`);
  res.json({
    success: true,
    data: { urls }
  });
});

export default router;
