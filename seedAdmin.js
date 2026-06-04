require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env');
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'Main Super Admin';
    const adminPhone = process.env.ADMIN_PHONE || '0000000000';

    if (!adminEmail || !adminPassword) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be defined in .env');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully.');

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists. Recreating with current .env credentials.');
      await User.deleteOne({ email: adminEmail });
    }

    const adminUser = new User({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'Super Admin',
      phone: adminPhone
    });

    await adminUser.save();
    console.log(`Super Admin user created successfully with email: ${adminEmail}`);
  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedAdmin();
