import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/database.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

import Product from './models/Product.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import resellerRoutes from './routes/resellerRoutes.js';
// import walletRoutes from './routes/walletRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import chatRoutes from './routes/chatRoutes.js'; // NEW: Chat routes

import adminResellerRoutes from './routes/adminResellerRoutes.js';
import returnRoutes from './routes/returnRoutes.js';
import shiprocketRoutes from './routes/shiprocketRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

import paymentRoutes from './routes/paymentRoutes.js';

import bannerRoutes from './routes/bannerRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import adminProductRoutes from './routes/adminProductRoutes.js';
import couponRoutes from './routes/couponRoutes.js';

import wishlistRoutes from './routes/wishlistRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import appSettingRoutes from './routes/appSettingRoutes.js';

import developerRoutes from './routes/developerRoutes.js';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
})); // Security headers
// CORS Configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['*'] // Allow all in production (for mobile apps)
  : [process.env.CLIENT_URL, process.env.ADMIN_URL]; // Specific in development

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? '*' : allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve uploaded files
// Explicitly allow cross-origin access for static files
app.use((req, res, next) => {
  if (req.path.startsWith('/uploads') || req.path.startsWith('/temp') || req.path.startsWith('/products') || req.path.startsWith('/users') || req.path.startsWith('/banners') || req.path.startsWith('/categories') || req.path.startsWith('/logos')) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  }
  next();
});

app.use('/uploads', express.static('/root/uploads'));
app.use('/uploads/temp', express.static('/root/uploads/temp'));
app.use('/uploads/products', express.static('/root/uploads/products'));
app.use('/uploads/banners', express.static('/root/uploads/banners'));
app.use('/uploads/categories', express.static('/root/uploads/categories'));
app.use('/uploads/logos', express.static('/root/uploads/logos'));

// Support direct access (as seen in PM2 logs)
app.use('/temp', express.static('/root/uploads/temp'));
app.use('/products', express.static('/root/uploads/products'));
app.use('/users', express.static('/root/uploads/users'));
app.use('/banners', express.static('/root/uploads/banners'));
app.use('/categories', express.static('/root/uploads/categories'));
app.use('/logos', express.static('/root/uploads/logos'));

// Deep Linking Verification
app.use('/.well-known', express.static('.well-known', {
  setHeaders: (res, path) => {
    if (path.endsWith('apple-app-site-association') || path.endsWith('assetlinks.json')) {
      res.set('Content-Type', 'application/json');
    }
  }
}));

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reseller', resellerRoutes);
// app.use('/api/wallet', walletRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use(
  '/api/webhooks',
  express.raw({ type: 'application/json' }),
  webhookRoutes
);

app.use('/api/categories', categoryRoutes);
app.use('/api/chat', chatRoutes); // NEW: Chat API mount

app.use('/api/admin/resellers', adminResellerRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/shiprocket', shiprocketRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dev', developerRoutes);

app.use('/api/banners', bannerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/coupons', couponRoutes);


app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/settings', appSettingRoutes);


// console.log('🔑 Razorpay Key:', process.env.RAZORPAY_KEY_ID);


// Product Landing Page (Dynamic fallback for browser/deep links)
app.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Fetch product
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).send(`
        <div style="text-align: center; padding: 50px; font-family: sans-serif;">
          <h1>Product Not Found</h1>
          <p>We couldn't find the product you're looking for.</p>
          <a href="/" style="color: #4F46E5; text-decoration: none; font-weight: bold;">Return to Home</a>
        </div>
      `);
    }

    // 2. Prepare metadata
    const title = product.title || 'Product';
    const description = product.description || 'View this product on New Raj Fancy Store';

    // Improved Image URL logic
    let firstImage = 'https://newrajfancystore.adsngrow.in/logo.png';
    if (product.images && product.images.length > 0) {
      let imgPath = product.images[0];
      if (imgPath.startsWith('http')) {
        firstImage = imgPath;
      } else {
        // Consistently remove ALL leading slashes
        while (imgPath.startsWith('/')) {
          imgPath = imgPath.substring(1);
        }
        // If it already includes 'uploads/', it's a full relative path
        if (imgPath.startsWith('uploads/')) {
          firstImage = `https://newrajfancystore.adsngrow.in/${imgPath}`;
        } else if (imgPath.startsWith('temp-')) {
          firstImage = `https://newrajfancystore.adsngrow.in/temp/${imgPath}`;
        } else {
          // Default to /products/ if it's just a filename
          firstImage = `https://newrajfancystore.adsngrow.in/products/${imgPath}`;
        }
      }
    }
    console.log(`Generated firstImage for product ${productId}: ${firstImage}`);

    const price = product.price ? `₹${product.price}` : '';
    const productUrl = `https://newrajfancystore.adsngrow.in/product/${productId}`;
    const appDeepLink = `rajfancy://product/${productId}`;

    // 3. Render Landing Page
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | New Raj Fancy Store</title>
    
    <!-- Open Graph (WhatsApp, Telegram, FB) -->
    <meta property="og:title" content="${title} - ${price}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${firstImage}">
    <meta property="og:url" content="${productUrl}">
    <meta property="og:type" content="product">
    
    <!-- Smart Banner for iOS -->
    <meta name="apple-itunes-app" content="app-id=com.mobile, app-argument=${appDeepLink}">

    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #F9FAFB; margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; color: #111827; }
        .card { background: white; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); padding: 32px; max-width: 400px; text-align: center; width: 90%; }
        .product-img { width: 100%; border-radius: 12px; margin-bottom: 24px; aspect-ratio: 1; object-fit: cover; }
        h1 { font-size: 22px; margin: 0 0 12px; }
        .price { font-size: 24px; font-weight: bold; color: #4F46E5; margin-bottom: 16px; }
        .desc { color: #6B7280; font-size: 14px; margin-bottom: 32px; line-height: 1.5; }
        .btn { background: #4F46E5; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; display: block; transition: transform 0.2s; }
        .btn:active { transform: scale(0.98); }
        .footer-logo { margin-top: 24px; opacity: 0.5; font-size: 12px; }
    </style>
</head>
<body>
    <div class="card">
        <img src="${firstImage}" class="product-img" alt="${title}">
        <h1>${title}</h1>
        <div class="price">${price}</div>
        <p class="desc">${description.substring(0, 150)}${description.length > 150 ? '...' : ''}</p>
        
        <a href="${appDeepLink}" class="btn" id="open-btn">Open in App</a>
        
        <div class="footer-logo">New Raj Fancy Store</div>
    </div>

    <script>
        // Auto-redirect Attempt
        window.onload = function() {
            // Attempt to open the app after a tiny delay
            setTimeout(function() {
                window.location.href = "${appDeepLink}";
            }, 500);
        };
    </script>
</body>
</html>
    `);
  } catch (error) {
    console.error('Landing page error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'E-Commerce Reseller API',
    version: '1.0.0',
    docs: '/api-docs'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

import { initSocket } from './utils/socket.js'; // NEW: Socket.io

// Start server
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

// Initialize Socket.io
initSocket(server);


// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

export default app;