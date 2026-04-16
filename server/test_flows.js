import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import Wallet from './models/Wallet.js';
import OrderStateMachine from './utils/OrderStateMachine.js';

async function runTests() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Setup Test Data
    const user = new User({
      name: 'Test Customer',
      email: `test_customer_${Date.now()}@example.com`,
      phone: `99${Math.floor(Math.random() * 100000000)}`,
      password: 'Password123!',
      role: 'customer'
    });
    await user.save();

    const reseller = new User({
      name: 'Test Reseller',
      email: `test_reseller_${Date.now()}@example.com`,
      phone: `98${Math.floor(Math.random() * 100000000)}`,
      password: 'Password123!',
      role: 'reseller',
      resellerApplication: { status: 'approved' }
    });
    await reseller.save();

    const wallet = new Wallet({
      user: reseller._id,
      balance: 0,
      pendingBalance: 200, // OrderController adds to pending on creation for COD
      totalEarned: 0
    });
    await wallet.save();

    const product = new Product({
      title: 'Test Resell Product',
      description: 'Testing',
      price: 1000,
      mrp: 1200,
      sku: `SKU-${Date.now()}`,
      discountPrice: 800,
      resellerPrice: 600,
      stock: 10,
      vendor: user._id, 
      category: new mongoose.Types.ObjectId() // Mock Category ID
    });
    await product.save();

    // Create Order
    const order = new Order({
      orderNo: `TEST-${Date.now()}`,
      user: user._id,
      items: [{
        product: product._id,
        sku: product.sku,
        quantity: 1,
        basePrice: 600,
        resellPrice: 200,
        finalPrice: 800
      }],
      shippingAddress: {
        name: 'Test', phone: '123', addressLine1: 'Test', city: 'Test', state: 'Test', pincode: '123456'
      },
      subtotal: 800,
      shipping: 0,
      tax: 0,
      total: 800,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      orderStatus: 'pending',
      reseller: reseller._id,
      resellerEarning: 200,
      resellerEarningStatus: 'pending'
    });
    await order.save();

    console.log('🛍️ Order created, status:', order.orderStatus);

    // Simulate Admin Transitions
    await OrderStateMachine.updateOrderStatus(order, 'confirmed', { changedBy: user._id });
    await OrderStateMachine.updateOrderStatus(order, 'processing', { changedBy: user._id });
    await OrderStateMachine.updateOrderStatus(order, 'packed', { changedBy: user._id });
    await OrderStateMachine.updateOrderStatus(order, 'shipped', { changedBy: user._id });
    await OrderStateMachine.updateOrderStatus(order, 'delivered', { changedBy: user._id });
    await order.save();
    
    console.log('📦 Order delivered. Resell Wallet Pending:', (await Wallet.findOne({ user: reseller._id })).pendingBalance);

    // Simulate Completion (Bypassing return window)
    await OrderStateMachine.updateOrderStatus(order, 'completed', { changedBy: user._id });
    await order.save();

    const finalWallet = await Wallet.findOne({ user: reseller._id });
    console.log(`🏦 Final Reseller Wallet => Balance: ${finalWallet.balance}, Pending: ${finalWallet.pendingBalance}`);

    if (finalWallet.balance === 200 && finalWallet.pendingBalance === 0) {
      console.log('🎉 SUCCESS: Money was correctly transferred from pending to available balance!');
    } else {
      console.error('❌ BUG FAILED: Wallet balance incorrect!');
    }

    // Attempt cancellation to ensure it reverses
    // (Wait, can't cancel a completed order via state machine terminal checks)
    
    // Cleanup
    await User.deleteMany({ email: { $regex: 'test_' } });
    await Wallet.deleteMany({ user: reseller._id });
    await Product.deleteMany({ title: 'Test Resell Product' });
    await Order.deleteMany({ orderNo: { $regex: 'TEST-' } });

    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    mongoose.disconnect();
  }
}

runTests();
