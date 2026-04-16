// ============================================
// backend/seeders/seed.js
// ============================================
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Vendor from '../models/Vendor.js';
import Reseller from '../models/Reseller.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import Address from '../models/Address.js';
import Review from '../models/Review.js';
import Wallet from '../models/Wallet.js';
import WalletTransaction from '../models/WalletTransaction.js';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clear existing data
const clearDatabase = async () => {
  try {
    await User.deleteMany({});
    await Vendor.deleteMany({});
    await Reseller.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Cart.deleteMany({});
    await Order.deleteMany({});
    await Address.deleteMany({});
    await Review.deleteMany({});
    await Wallet.deleteMany({});
    await WalletTransaction.deleteMany({});
    console.log('🗑️  Database cleared');
  } catch (error) {
    console.error('Error clearing database:', error);
  }
};

// Create Users
const createUsers = async () => {
  const users = [
    // Admin
    {
      name: 'Admin User',
      email: 'admin@ecommerce.com',
      password: 'admin123',
      role: 'admin',
      emailVerified: true,
      isActive: true
    },
    // Vendors
    {
      name: 'Rahul Electronics',
      email: 'rahul@electronics.com',
      phone: '9876543210',
      password: 'vendor123',
      role: 'vendor',
      emailVerified: true,
      isActive: true
    },
    {
      name: 'Fashion Hub',
      email: 'fashion@hub.com',
      phone: '9876543211',
      password: 'vendor123',
      role: 'vendor',
      emailVerified: true,
      isActive: true
    },
    {
      name: 'Home Decor Store',
      email: 'homedecor@store.com',
      phone: '9876543212',
      password: 'vendor123',
      role: 'vendor',
      emailVerified: true,
      isActive: true
    },
    // Resellers
    {
      name: 'Priya Sharma',
      email: 'priya@reseller.com',
      phone: '9876543213',
      password: 'reseller123',
      role: 'reseller',
      emailVerified: true,
      isActive: true
    },
    {
      name: 'Amit Kumar',
      email: 'amit@reseller.com',
      phone: '9876543214',
      password: 'reseller123',
      role: 'reseller',
      emailVerified: true,
      isActive: true
    },
    // Customers
    {
      name: 'Neha Patel',
      email: 'neha@customer.com',
      phone: '9876543215',
      password: 'customer123',
      role: 'customer',
      emailVerified: true,
      isActive: true
    },
    {
      name: 'Vijay Singh',
      email: 'vijay@customer.com',
      phone: '9876543216',
      password: 'customer123',
      role: 'customer',
      emailVerified: true,
      isActive: true
    },
    {
      name: 'Anjali Verma',
      email: 'anjali@customer.com',
      phone: '9876543217',
      password: 'customer123',
      role: 'customer',
      emailVerified: true,
      isActive: true
    }
  ];

  const createdUsers = await User.create(users);
  console.log('✅ Users created:', createdUsers.length);
  return createdUsers;
};

// Create Vendors
const createVendors = async (users) => {
  const vendorUsers = users.filter(u => u.role === 'vendor');
  
  const vendors = [
    {
      user: vendorUsers[0]._id,
      storeName: 'Rahul Electronics Store',
      storeDescription: 'Your one-stop shop for all electronics and gadgets',
      gstNumber: 'GST1234567890',
      panNumber: 'ABCDE1234F',
      status: 'approved',
      bankDetails: {
        accountNumber: '1234567890',
        ifscCode: 'SBIN0001234',
        accountHolderName: 'Rahul Electronics',
        bankName: 'State Bank of India'
      },
      businessAddress: {
        addressLine1: '123 Electronics Market',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India'
      },
      commissionRate: 5,
      totalSales: 25000,
      totalProducts: 15
    },
    {
      user: vendorUsers[1]._id,
      storeName: 'Fashion Hub',
      storeDescription: 'Trendy clothes and accessories for everyone',
      gstNumber: 'GST9876543210',
      panNumber: 'FGHIJ5678K',
      status: 'approved',
      bankDetails: {
        accountNumber: '9876543210',
        ifscCode: 'HDFC0001234',
        accountHolderName: 'Fashion Hub',
        bankName: 'HDFC Bank'
      },
      businessAddress: {
        addressLine1: '456 Fashion Street',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        country: 'India'
      },
      commissionRate: 5,
      totalSales: 35000,
      totalProducts: 20
    },
    {
      user: vendorUsers[2]._id,
      storeName: 'Home Decor Paradise',
      storeDescription: 'Beautiful home decor items and furniture',
      gstNumber: 'GST5555555555',
      panNumber: 'KLMNO9012P',
      status: 'approved',
      bankDetails: {
        accountNumber: '5555555555',
        ifscCode: 'ICIC0001234',
        accountHolderName: 'Home Decor Store',
        bankName: 'ICICI Bank'
      },
      businessAddress: {
        addressLine1: '789 Decor Avenue',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        country: 'India'
      },
      commissionRate: 5,
      totalSales: 18000,
      totalProducts: 12
    }
  ];

  const createdVendors = await Vendor.create(vendors);
  console.log('✅ Vendors created:', createdVendors.length);
  return createdVendors;
};

// Create Resellers and Wallets
const createResellers = async (users) => {
  const resellerUsers = users.filter(u => u.role === 'reseller');
  
  const resellers = [];
  const wallets = [];
  
  for (let i = 0; i < resellerUsers.length; i++) {
    const wallet = await Wallet.create({
      user: resellerUsers[i]._id,
      balance: 5000 + (i * 1000),
      pendingBalance: 2000,
      totalEarned: 15000 + (i * 5000),
      totalWithdrawn: 10000 + (i * 3000)
    });
    
    wallets.push(wallet);
    
    resellers.push({
      user: resellerUsers[i]._id,
      storeName: `${resellerUsers[i].name}'s Store`,
      referralCode: `REF${1000 + i}`,
      defaultMargin: 10 + (i * 5),
      wallet: wallet._id,
      totalSales: 20000 + (i * 10000),
      totalEarnings: 15000 + (i * 5000),
      kycStatus: i === 0 ? 'approved' : 'pending'
    });
  }

  const createdResellers = await Reseller.create(resellers);
  console.log('✅ Resellers created:', createdResellers.length);
  console.log('✅ Wallets created:', wallets.length);
  return createdResellers;
};

// Create Categories
const createCategories = async () => {
  const categories = [
    {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and gadgets',
      isActive: true,
      sortOrder: 1
    },
    {
      name: 'Fashion',
      slug: 'fashion',
      description: 'Clothing and accessories',
      isActive: true,
      sortOrder: 2
    },
    {
      name: 'Home & Living',
      slug: 'home-living',
      description: 'Home decor and furniture',
      isActive: true,
      sortOrder: 3
    },
    {
      name: 'Books',
      slug: 'books',
      description: 'Books and stationery',
      isActive: true,
      sortOrder: 4
    },
    {
      name: 'Sports',
      slug: 'sports',
      description: 'Sports equipment and accessories',
      isActive: true,
      sortOrder: 5
    }
  ];

  const createdCategories = await Category.create(categories);
  console.log('✅ Categories created:', createdCategories.length);
  return createdCategories;
};

// Create Products
const createProducts = async (vendors, categories) => {
  const products = [
    // Electronics
    {
      vendor: vendors[0]._id,
      category: categories[0]._id,
      title: 'Wireless Bluetooth Headphones',
      description: 'Premium wireless headphones with noise cancellation and 30-hour battery life',
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
      price: 2499,
      mrp: 4999,
      discount: 50,
      stock: 50,
      sku: 'WBH001',
      status: 'approved',
      isActive: true,
      averageRating: 4.5,
      reviewCount: 124,
      soldCount: 89
    },
    {
      vendor: vendors[0]._id,
      category: categories[0]._id,
      title: 'Smart Watch Pro',
      description: 'Feature-rich smartwatch with heart rate monitor, GPS, and 7-day battery',
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'],
      price: 3999,
      mrp: 7999,
      discount: 50,
      stock: 30,
      sku: 'SWP001',
      status: 'approved',
      isActive: true,
      averageRating: 4.3,
      reviewCount: 89,
      soldCount: 67
    },
    {
      vendor: vendors[0]._id,
      category: categories[0]._id,
      title: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse with adjustable DPI and long battery life',
      images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500'],
      price: 599,
      mrp: 1299,
      discount: 54,
      stock: 100,
      sku: 'WM001',
      status: 'approved',
      isActive: true,
      averageRating: 4.2,
      reviewCount: 56,
      soldCount: 145
    },
    {
      vendor: vendors[0]._id,
      category: categories[0]._id,
      title: 'USB-C Hub 7-in-1',
      description: 'Multi-port USB-C hub with HDMI, USB 3.0, SD card reader',
      images: ['https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500'],
      price: 1299,
      mrp: 2499,
      discount: 48,
      stock: 75,
      sku: 'HUB001',
      status: 'approved',
      isActive: true,
      averageRating: 4.6,
      reviewCount: 43,
      soldCount: 98
    },
    {
      vendor: vendors[0]._id,
      category: categories[0]._id,
      title: 'Portable Power Bank 20000mAh',
      description: 'High-capacity power bank with fast charging and dual USB ports',
      images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500'],
      price: 1499,
      mrp: 2999,
      discount: 50,
      stock: 60,
      sku: 'PB001',
      status: 'approved',
      isActive: true,
      averageRating: 4.4,
      reviewCount: 78,
      soldCount: 112
    },
    // Fashion
    {
      vendor: vendors[1]._id,
      category: categories[1]._id,
      title: 'Cotton T-Shirt - Pack of 3',
      description: 'Comfortable cotton t-shirts in assorted colors',
      images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'],
      price: 899,
      mrp: 1799,
      discount: 50,
      stock: 200,
      sku: 'TS001',
      status: 'approved',
      isActive: true,
      averageRating: 4.1,
      reviewCount: 234,
      soldCount: 456
    },
    {
      vendor: vendors[1]._id,
      category: categories[1]._id,
      title: 'Denim Jeans - Slim Fit',
      description: 'Stylish slim-fit denim jeans for men',
      images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'],
      price: 1299,
      mrp: 2599,
      discount: 50,
      stock: 150,
      sku: 'DJ001',
      status: 'approved',
      isActive: true,
      averageRating: 4.3,
      reviewCount: 167,
      soldCount: 289
    },
    {
      vendor: vendors[1]._id,
      category: categories[1]._id,
      title: 'Summer Dress - Floral Print',
      description: 'Beautiful floral print summer dress for women',
      images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500'],
      price: 1499,
      mrp: 2999,
      discount: 50,
      stock: 80,
      sku: 'SD001',
      status: 'approved',
      isActive: true,
      averageRating: 4.5,
      reviewCount: 123,
      soldCount: 198
    },
    {
      vendor: vendors[1]._id,
      category: categories[1]._id,
      title: 'Leather Wallet',
      description: 'Genuine leather wallet with multiple card slots',
      images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=500'],
      price: 799,
      mrp: 1599,
      discount: 50,
      stock: 120,
      sku: 'LW001',
      status: 'approved',
      isActive: true,
      averageRating: 4.4,
      reviewCount: 89,
      soldCount: 234
    },
    {
      vendor: vendors[1]._id,
      category: categories[1]._id,
      title: 'Sports Shoes - Running',
      description: 'Lightweight running shoes with excellent cushioning',
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'],
      price: 2499,
      mrp: 4999,
      discount: 50,
      stock: 90,
      sku: 'SS001',
      status: 'approved',
      isActive: true,
      averageRating: 4.6,
      reviewCount: 156,
      soldCount: 178
    },
    // Home & Living
    {
      vendor: vendors[2]._id,
      category: categories[2]._id,
      title: 'Decorative Wall Clock',
      description: 'Modern decorative wall clock for living room',
      images: ['https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=500'],
      price: 1299,
      mrp: 2599,
      discount: 50,
      stock: 45,
      sku: 'WC001',
      status: 'approved',
      isActive: true,
      averageRating: 4.3,
      reviewCount: 67,
      soldCount: 89
    },
    {
      vendor: vendors[2]._id,
      category: categories[2]._id,
      title: 'Cotton Bedsheet Set',
      description: 'Premium cotton bedsheet set with 2 pillow covers',
      images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500'],
      price: 1799,
      mrp: 3599,
      discount: 50,
      stock: 70,
      sku: 'BS001',
      status: 'approved',
      isActive: true,
      averageRating: 4.5,
      reviewCount: 134,
      soldCount: 167
    },
    {
      vendor: vendors[2]._id,
      category: categories[2]._id,
      title: 'LED String Lights',
      description: 'Decorative LED string lights for home decoration',
      images: ['https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500'],
      price: 499,
      mrp: 999,
      discount: 50,
      stock: 150,
      sku: 'LS001',
      status: 'approved',
      isActive: true,
      averageRating: 4.2,
      reviewCount: 89,
      soldCount: 234
    },
    {
      vendor: vendors[2]._id,
      category: categories[2]._id,
      title: 'Indoor Plant with Pot',
      description: 'Beautiful indoor plant with decorative ceramic pot',
      images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500'],
      price: 799,
      mrp: 1599,
      discount: 50,
      stock: 55,
      sku: 'IP001',
      status: 'approved',
      isActive: true,
      averageRating: 4.4,
      reviewCount: 45,
      soldCount: 78
    },
    {
      vendor: vendors[2]._id,
      category: categories[2]._id,
      title: 'Cushion Covers Set of 5',
      description: 'Colorful cushion covers to brighten your living space',
      images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500'],
      price: 999,
      mrp: 1999,
      discount: 50,
      stock: 100,
      sku: 'CC001',
      status: 'approved',
      isActive: true,
      averageRating: 4.1,
      reviewCount: 67,
      soldCount: 145
    }
  ];

  const createdProducts = await Product.create(products);
  console.log('✅ Products created:', createdProducts.length);
  return createdProducts;
};

// Create Addresses
const createAddresses = async (users) => {
  const customerUsers = users.filter(u => u.role === 'customer');
  
  const addresses = [];
  customerUsers.forEach(user => {
    addresses.push({
      user: user._id,
      name: user.name,
      phone: user.phone,
      addressLine1: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India',
      addressType: 'home',
      isDefault: true
    });
  });

  const createdAddresses = await Address.create(addresses);
  console.log('✅ Addresses created:', createdAddresses.length);
  return createdAddresses;
};

// Create Orders
const createOrders = async (users, products, vendors, resellers) => {
  const customerUsers = users.filter(u => u.role === 'customer');
  
  const orders = [
    {
      user: customerUsers[0]._id,
      vendor: vendors[0]._id,
      reseller: resellers[0]._id,
      items: [{
        product: products[0]._id,
        productTitle: products[0].title,
        quantity: 2,
        price: products[0].price,
        total: products[0].price * 2,
        platformFee: (products[0].price * 2 * 0.05),
        resellerCommission: (products[0].price * 2 * 0.10),
        vendorSettlement: (products[0].price * 2 * 0.85)
      }],
      shippingAddress: {
        name: customerUsers[0].name,
        phone: customerUsers[0].phone,
        addressLine1: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India'
      },
      subtotal: products[0].price * 2,
      shippingCost: 50,
      tax: 0,
      discount: 0,
      total: (products[0].price * 2) + 50,
      paymentMethod: 'online',
      paymentStatus: 'completed',
      orderStatus: 'delivered',
      deliveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      user: customerUsers[1]._id,
      vendor: vendors[1]._id,
      items: [{
        product: products[5]._id,
        productTitle: products[5].title,
        quantity: 1,
        price: products[5].price,
        total: products[5].price,
        platformFee: (products[5].price * 0.05),
        resellerCommission: 0,
        vendorSettlement: (products[5].price * 0.95)
      }],
      shippingAddress: {
        name: customerUsers[1].name,
        phone: customerUsers[1].phone,
        addressLine1: '456 Park Avenue',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        country: 'India'
      },
      subtotal: products[5].price,
      shippingCost: 0,
      tax: 0,
      discount: 0,
      total: products[5].price,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      orderStatus: 'shipped',
      shippedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      trackingNumber: 'TRK123456789',
      courierName: 'Delhivery'
    },
    {
      user: customerUsers[2]._id,
      vendor: vendors[2]._id,
      reseller: resellers[1]._id,
      items: [{
        product: products[10]._id,
        productTitle: products[10].title,
        quantity: 1,
        price: products[10].price,
        total: products[10].price,
        platformFee: (products[10].price * 0.05),
        resellerCommission: (products[10].price * 0.15),
        vendorSettlement: (products[10].price * 0.80)
      }],
      shippingAddress: {
        name: customerUsers[2].name,
        phone: customerUsers[2].phone,
        addressLine1: '789 Garden Road',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        country: 'India'
      },
      subtotal: products[10].price,
      shippingCost: 50,
      tax: 0,
      discount: 0,
      total: products[10].price + 50,
      paymentMethod: 'online',
      paymentStatus: 'completed',
      orderStatus: 'confirmed',
      confirmedAt: new Date()
    }
  ];

  const createdOrders = await Order.create(orders);
  console.log('✅ Orders created:', createdOrders.length);
  return createdOrders;
};

// Create Reviews
const createReviews = async (users, products, orders) => {
  const reviews = [
    {
      product: products[0]._id,
      user: users[6]._id,
      order: orders[0]._id,
      rating: 5,
      title: 'Excellent product!',
      comment: 'The headphones are amazing. Sound quality is superb and battery life is great.',
      isVerifiedPurchase: true,
      helpfulCount: 12
    },
    {
      product: products[0]._id,
      user: users[7]._id,
      order: orders[0]._id,
      rating: 4,
      title: 'Good value for money',
      comment: 'Nice headphones but could be more comfortable for long use.',
      isVerifiedPurchase: true,
      helpfulCount: 8
    },
    {
      product: products[5]._id,
      user: users[8]._id,
      order: orders[1]._id,
      rating: 5,
      title: 'Perfect fit!',
      comment: 'The t-shirts fit perfectly and the fabric quality is excellent.',
      isVerifiedPurchase: true,
      helpfulCount: 15
    }
  ];

  const createdReviews = await Review.create(reviews);
  console.log('✅ Reviews created:', createdReviews.length);
  return createdReviews;
};

// Main seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');
    
    await connectDB();
    await clearDatabase();
    
    console.log('\n📦 Creating data...\n');
    
    const users = await createUsers();
    const vendors = await createVendors(users);
    const resellers = await createResellers(users);
    const categories = await createCategories();
    const products = await createProducts(vendors, categories);
    const addresses = await createAddresses(users);
    const orders = await createOrders(users, products, vendors, resellers);
    const reviews = await createReviews(users, products, orders);
    
    console.log('\n✨ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Vendors: ${vendors.length}`);
    console.log(`   Resellers: ${resellers.length}`);
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Products: ${products.length}`);
    console.log(`   Addresses: ${addresses.length}`);
    console.log(`   Orders: ${orders.length}`);
    console.log(`   Reviews: ${reviews.length}`);
    console.log('\n🔑 Login Credentials:');
    console.log('   Admin: admin@ecommerce.com / admin123');
    console.log('   Vendor: rahul@electronics.com / vendor123');
    console.log('   Reseller: priya@reseller.com / reseller123');
    console.log('   Customer: neha@customer.com / customer123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();