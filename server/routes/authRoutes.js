// ============================================
// backend/routes/authRoutes.js
// ============================================
import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { registerValidation, loginValidation, validate } from '../middleware/validation.js';
import { authLimiter } from '../middleware/rateLimit.js';

import { uploadUser } from '../middleware/fileUpload.js';

const router = express.Router();

router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

/**
 * @desc    Upload user avatar
 * @route   POST /api/auth/avatar
 * @access  Private
 */
router.post('/avatar', protect, uploadUser.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload an image' });
  }

  res.json({
    success: true,
    data: {
      url: `/uploads/users/${req.file.filename}`
    }
  });
});

export default router;