// ============================================
// backend/utils/seeder.js
// ============================================
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Vendor from '../models/Vendor.js';
import Reseller from '../models/Reseller.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Wallet from '../models/Wallet.js';
import connectDB from '../config/database.js';

dotenv.config();

/**
 * Seed database with initial data
 */
const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Vendor.deleteMany({});
    await Reseller.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Wallet.deleteMany({});

    console.log('👤 Creating users...');

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Admin@123',
      role: 'admin'
    });
    console.log('✅ Admin created');

    // Create Vendor
    const vendorUser = await User.create({
      name: 'Fashion Store',
      email: 'vendor@example.com',
      password: 'Vendor@123',
      role: 'vendor',
      emailVerified: true
    });

    const vendor = await Vendor.create({
      user: vendorUser._id,
      storeName: 'Fashion Store',
      storeDescription: 'Best fashion products at affordable prices',
      status: 'approved',
      gstNumber: 'GST123456789',
      panNumber: 'ABCDE1234F',
      bankDetails: {
        accountNumber: '1234567890',
        ifscCode: 'HDFC0001234',
        accountHolderName: 'Fashion Store',
        bankName: 'HDFC Bank'
      }
    });
    console.log('✅ Vendor created');

    // Create Reseller
    const resellerUser = await User.create({
      name: 'John Reseller',
      email: 'reseller@example.com',
      password: 'Reseller@123',
      role: 'reseller',
      phone: '9876543210',
      emailVerified: true,
      phoneVerified: true
    });

    const resellerWallet = await Wallet.create({
      user: resellerUser._id
    });

    const reseller = await Reseller.create({
      user: resellerUser._id,
      storeName: "John's Store",
      referralCode: 'JOHN2024',
      wallet: resellerWallet._id,
      defaultMargin: 15
    });
    console.log('✅ Reseller created');

    // Create Customer
    const customer = await User.create({
      name: 'Customer User',
      email: 'customer@example.com',
      password: 'Customer@123',
      role: 'customer',
      phone: '9876543211',
      emailVerified: true
    });
    console.log('✅ Customer created');

    // Create Categories
    console.log('📁 Creating categories...');
    const categories = await Category.create([
      {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic items and gadgets',
        isActive: true
      },
      {
        name: 'Fashion',
        slug: 'fashion',
        description: 'Clothing and accessories',
        isActive: true
      },
      {
        name: 'Home & Kitchen',
        slug: 'home-kitchen',
        description: 'Home and kitchen appliances',
        isActive: true
      },
      {
        name: 'Books',
        slug: 'books',
        description: 'Books and stationery',
        isActive: true
      },
      {
        name: 'Sports',
        slug: 'sports',
        description: 'Sports equipment and accessories',
        isActive: true
      }
    ]);
    console.log('✅ Categories created');

    // Create Products
    console.log('📦 Creating products...');
    const products = await Product.create([
      {
        vendor: vendor._id,
        category: categories[1]._id, // Fashion
        title: 'Premium Cotton T-Shirt',
        description: 'High quality cotton t-shirt available in multiple colors',
        images: [
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
          'https://images.unsplash.com/photo-1503341338985-c962a7a0b4b3?w=500'
        ],
        price: 499,
        mrp: 999,
        discount: 50,
        stock: 100,
        sku: 'TSHIRT001',
        status: 'approved',
        isActive: true,
        attributes: new Map([
          ['size', 'M, L, XL'],
          ['color', 'Black, White, Blue']
        ]),
        specifications: [
          { key: 'Material', value: '100% Cotton' },
          { key: 'Fit', value: 'Regular' }
        ]
      },
      {
        vendor: vendor._id,
        category: categories[1]._id,
        title: 'Denim Jeans',
        description: 'Comfortable denim jeans with perfect fit',
        images: [
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'
        ],
        price: 1299,
        mrp: 2499,
        discount: 48,
        stock: 50,
        sku: 'JEANS001',
        status: 'approved',
        isActive: true,
        attributes: new Map([
          ['size', '30, 32, 34, 36'],
          ['color', 'Blue, Black']
        ])
      },
      {
        vendor: vendor._id,
        category: categories[1]._id,
        title: 'Sports Shoes',
        description: 'Comfortable sports shoes for running and gym',
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'
        ],
        price: 1999,
        mrp: 3999,
        discount: 50,
        stock: 75,
        sku: 'SHOES001',
        status: 'approved',
        isActive: true,
        attributes: new Map([
          ['size', '7, 8, 9, 10, 11'],
          ['color', 'Black, White, Blue']
        ])
      },
      {
        vendor: vendor._id,
        category: categories[1]._id,
        title: 'Leather Wallet',
        description: 'Premium leather wallet with multiple card slots',
        images: [
          'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500'
        ],
        price: 799,
        mrp: 1499,
        discount: 47,
        stock: 200,
        sku: 'WALLET001',
        status: 'approved',
        isActive: true,
        attributes: new Map([
          ['color', 'Brown, Black'],
          ['material', 'Genuine Leather']
        ])
      },
      {
        vendor: vendor._id,
        category: categories[1]._id,
        title: 'Sunglasses',
        description: 'UV protected stylish sunglasses',
        images: [
          'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500'
        ],
        price: 599,
        mrp: 1299,
        discount: 54,
        stock: 150,
        sku: 'GLASSES001',
        status: 'approved',
        isActive: true,
        attributes: new Map([
          ['frame', 'Metal, Plastic'],
          ['lens', 'Polarized']
        ])
      },
      {
        vendor: vendor._id,
        category: categories[0]._id, // Electronics
        title: 'Wireless Earbuds',
        description: 'Premium wireless earbuds with noise cancellation',
        images: [
          'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500'
        ],
        price: 2499,
        mrp: 4999,
        discount: 50,
        stock: 80,
        sku: 'EARBUDS001',
        status: 'approved',
        isActive: true,
        attributes: new Map([
          ['color', 'Black, White'],
          ['battery', '24 hours']
        ])
      },
      {
        vendor: vendor._id,
        category: categories[0]._id,
        title: 'Smart Watch',
        description: 'Fitness tracker smart watch with heart rate monitor',
        images: [
          'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500'
        ],
        price: 3499,
        mrp: 6999,
        discount: 50,
        stock: 60,
        sku: 'WATCH001',
        status: 'approved',
        isActive: true,
        attributes: new Map([
          ['color', 'Black, Silver'],
          ['display', 'AMOLED']
        ])
      },
      {
        vendor: vendor._id,
        category: categories[0]._id,
        title: 'Portable Power Bank',
        description: '20000mAh fast charging power bank',
        images: [
          'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500'
        ],
        price: 1499,
        mrp: 2999,
        discount: 50,
        stock: 100,
        sku: 'POWERBANK001',
        status: 'approved',
        isActive: true,
        attributes: new Map([
          ['capacity', '20000mAh'],
          ['ports', '2 USB + 1 Type-C']
        ])
      },
      {
        vendor: vendor._id,
        category: categories[2]._id, // Home & Kitchen
        title: 'Coffee Maker',
        description: 'Automatic coffee maker with timer',
        images: [
          'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500'
        ],
        price: 2999,
        mrp: 5999,
        discount: 50,
        stock: 40,
        sku: 'COFFEE001',
        status: 'approved',
        isActive: true,
        attributes: new Map([
          ['capacity', '1.5 Liters'],
          ['power', '800W']
        ])
      },
      {
        vendor: vendor._id,
        category: categories[2]._id,
        title: 'Cookware Set',
        description: 'Non-stick cookware set of 5 pieces',
        images: [
          'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=500'
        ],
        price: 1999,
        mrp: 4999,
        discount: 60,
        stock: 30,
        sku: 'COOKWARE001',
        status: 'approved',
        isActive: true,
        attributes: new Map([
          ['pieces', '5'],
          ['material', 'Aluminum with non-stick coating']
        ])
      }
    ]);
    console.log('✅ Products created');

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('📝 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:');
    console.log('  Email: admin@example.com');
    console.log('  Password: Admin@123\n');
    console.log('Vendor:');
    console.log('  Email: vendor@example.com');
    console.log('  Password: Vendor@123\n');
    console.log('Reseller:');
    console.log('  Email: reseller@example.com');
    console.log('  Password: Reseller@123');
    console.log('  Referral Code: JOHN2024\n');
    console.log('Customer:');
    console.log('  Email: customer@example.com');
    console.log('  Password: Customer@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();