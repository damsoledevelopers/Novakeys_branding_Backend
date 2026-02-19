const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function fixSuperAdminPassword() {
  try {
    // Connect to MongoDB
    const dbName = process.env.MONGODB_DB_NAME || 'spireleap_crm';
    const mongoUri = process.env.MONGODB_URI || `mongodb://localhost:27017/${dbName}`;
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connected');
    console.log(`📊 Database: ${mongoose.connection.name}\n`);

    const adminEmail = 'admin@example.com';
    const adminPassword = 'Admin@123';
    
    // Find super admin
    const admin = await User.findOne({ 
      $or: [
        { email: adminEmail },
        { role: 'super_admin' }
      ]
    }).select('+password');

    if (!admin) {
      console.log('❌ Super Admin not found! Creating new one...');
      
      const newAdmin = new User({
        firstName: 'Super',
        lastName: 'Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'super_admin',
        phone: '+1-555-0000',
        isActive: true
      });
      
      await newAdmin.save();
      console.log('✅ Super Admin created!\n');
    } else {
      console.log(`✅ Found Super Admin: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Active: ${admin.isActive}`);
      console.log(`   Has Password: ${!!admin.password}\n`);
      
      // Force password update by marking it as modified
      admin.password = adminPassword;
      admin.markModified('password');
      await admin.save();
      
      console.log('✅ Password updated and hashed!\n');
      
      // Verify password works
      const testUser = await User.findOne({ email: adminEmail }).select('+password');
      const isMatch = await testUser.comparePassword(adminPassword);
      
      if (isMatch) {
        console.log('✅ Password verification successful!\n');
      } else {
        console.log('❌ Password verification failed!');
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 SUPER ADMIN LOGIN CREDENTIALS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Email    : ${adminEmail}`);
    console.log(`   Password : ${adminPassword}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🌐 Login URL: http://localhost:3000/auth/login\n');
    console.log('⚠️  Make sure there are NO SPACES before or after the password!\n');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixSuperAdminPassword();

