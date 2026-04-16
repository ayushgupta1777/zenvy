import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const DEVELOPER_EMAIL    = 'developer@system.local';
const DEVELOPER_PASSWORD = 'Root!Access2026';

const seedDeveloper = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const User = (await import('./models/User.js')).default;

    // Delete existing developer account to avoid double-hash issue
    await User.deleteOne({ email: DEVELOPER_EMAIL });
    console.log('Cleared old developer account (if any).');

    // Create fresh — let the pre-save hook do the hashing
    const dev = new User({
      name: 'MASTER SYSTEM',
      email: DEVELOPER_EMAIL,
      password: DEVELOPER_PASSWORD, // plain text — model will hash it
      role: 'developer',
      isActive: true,
      emailVerified: true
    });

    await dev.save(); // pre-save hook fires here and hashes properly

    console.log('\n-----------------------------------');
    console.log('✅ DEVELOPER ACCOUNT CREATED');
    console.log('   Email    :', DEVELOPER_EMAIL);
    console.log('   Password :', DEVELOPER_PASSWORD);
    console.log('-----------------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDeveloper();
