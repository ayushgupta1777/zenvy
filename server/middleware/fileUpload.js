import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

/**
 * Configure storage for multer
 * @param {string} folder - Destination folder under 'uploads/'
 */
const createStorage = (folder) => {
  const uploadPath = path.join('/root/uploads', folder);

  // Automatically create folders if they do not exist
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      // Generate secure unique filename
      const uniqueSuffix = crypto.randomBytes(8).toString('hex');
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${folder}-${Date.now()}-${uniqueSuffix}${ext}`);
    }
  });
};

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed!'), false);
  }
};

// Multer instances for different purposes
export const uploadProduct = multer({
  storage: createStorage('products'),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB Limit
});

export const uploadUser = multer({
  storage: createStorage('users'),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

export const uploadTemp = multer({
  storage: createStorage('temp'),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

export const uploadBanner = multer({
  storage: createStorage('banners'),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

export const uploadLogo = multer({
  storage: createStorage('logos'),
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
});

export const uploadCategory = multer({
  storage: createStorage('categories'),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Generic upload middleware for backward compatibility if needed
export const upload = uploadTemp;
