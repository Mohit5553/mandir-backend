const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const reset = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('Error: MONGODB_URI is not defined in .env file');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🕉️ Connected to MongoDB...');

    // Find by either old or new email to be robust
    let user = await User.findOne({ email: 'admin@mandir.com' });
    if (!user) {
      user = await User.findOne({ email: 'mahashivmandirtrusts@gmail.com' });
    }

    if (!user) {
      console.log('❌ No admin user found in database. Let\'s create a new one!');
      user = new User({
        name: 'मुख्य मंदिर प्रशासक',
        email: 'mahashivmandirtrusts@gmail.com',
        password: 'admin123',
        role: 'Super Admin',
        phone: '9792939973'
      });
      await user.save();
      console.log('✅ Created new Super Admin user!');
      console.log('   Email: mahashivmandirtrusts@gmail.com');
      console.log('   Password: admin123');
    } else {
      console.log(`👤 Found user: ${user.name} (${user.email})`);
      user.name = 'मुख्य मंदिर प्रशासक';
      user.email = 'mahashivmandirtrusts@gmail.com';
      user.password = 'admin123';
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      console.log('✅ Updated admin credentials!');
      console.log('   Name updated to: मुख्य मंदिर प्रशासक');
      console.log('   Email updated to: mahashivmandirtrusts@gmail.com');
      console.log('   Password reset to: admin123');
    }

    mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating admin:', error);
    process.exit(1);
  }
};

reset();
