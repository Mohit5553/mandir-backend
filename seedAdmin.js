require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in .env");
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully.');
    
    // Check if admin exists
    let adminUser = await User.findOne({ email: 'admin@mandir.com' });
    if (adminUser) {
      console.log('Admin user already exists! Deleting and recreating for exact match just in case...');
      await User.deleteOne({ email: 'admin@mandir.com' });
    }
    
    adminUser = new User({
      name: 'Main Super Admin',
      email: 'admin@mandir.com',
      password: 'mandir123',
      role: 'Super Admin',
      phone: '0000000000'
    });
    
    await adminUser.save();
    console.log('✅ Super Admin user created successfully with email: admin@mandir.com');
    
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedAdmin();
