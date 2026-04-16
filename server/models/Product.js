// ============================================
// backend/models/Product.js
// UPDATED - With Subcategory Support
// ============================================
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    default: null
  },
  // Parent category (e.g., "Rings")
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  // Subcategory (e.g., "Nose Rings", "Ear Rings")
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  images: [{
    type: String,
    required: true
  }],
  price: {
    type: Number,
    required: true,
    min: 0
  },
  mrp: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  sku: {
    type: String,
    required: true,
    unique: true
  },
  // Product attributes (size, color, etc.)
  attributes: {
    type: Map,
    of: String
  },
  specifications: [{
    key: String,
    value: String
  }],
  // Status and approval
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'draft'
  },
  rejectionReason: String,
  // Stats
  viewCount: {
    type: Number,
    default: 0
  },
  soldCount: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  // SEO
  seoTitle: String,
  seoDescription: String,
  // Search Keywords
  keywords: [String]
}, {
  timestamps: true
});

// Index for search and filtering
productSchema.index({ title: 'text', description: 'text', keywords: 'text' }, { weights: { title: 10, keywords: 5, description: 1 } });
productSchema.index({ vendor: 1, category: 1, subcategory: 1 });
productSchema.index({ category: 1, subcategory: 1, status: 1 });
productSchema.index({ status: 1, isActive: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;