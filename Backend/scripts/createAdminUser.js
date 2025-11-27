/**
 * Script to create an admin user
 * Run with: node scripts/createAdminUser.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@rootsreach.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123456';
const ADMIN_NAME = process.env.ADMIN_NAME || 'System Admin';
const ADMIN_PHONE = process.env.ADMIN_PHONE || '+919999999999';

async function createAdminUser() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI_ATLAS || process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ No MongoDB URI found in environment variables');
      process.exit(1);
    }

    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
    
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Name: ${existingAdmin.name}`);
      
      // Optionally update password if needed
      if (process.argv.includes('--reset-password')) {
        existingAdmin.password = ADMIN_PASSWORD;
        await existingAdmin.save();
        console.log('✅ Password has been reset');
      }
      
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create new admin user
    const adminUser = new User({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL.toLowerCase(),
      phone: ADMIN_PHONE,
      password: ADMIN_PASSWORD,
      role: 'admin',
      isVerified: true,
      emailVerified: true,
      phoneVerified: true,
      status: 'active'
    });

    await adminUser.save();

    console.log('✅ Admin user created successfully!');
    console.log('─────────────────────────────────');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Role: admin`);
    console.log('─────────────────────────────────');
    console.log('⚠️  Please change the password after first login!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    console.error(error.stack);
    await mongoose.connection.close();
    process.exit(1);
  }
}

createAdminUser();
