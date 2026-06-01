const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const newsRoutes = require('./routes/news');
const donationRoutes = require('./routes/donations');
const galleryRoutes = require('./routes/gallery');
const notificationRoutes = require('./routes/notifications');
const contactRoutes = require('./routes/contact');
const reportsRoutes = require('./routes/reports');

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/stats', require('./routes/stats'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Temple Trust API is running ✅' });
});

// Database connection & Server start
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/templetrust';
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log('📋 API Endpoints:');
      console.log('   GET  /api/health');
      console.log('   POST /api/auth/login');
      console.log('   POST /api/auth/register');
      console.log('   GET  /api/events');
      console.log('   GET  /api/news');
      console.log('   POST /api/donations/create-order');
      console.log('   GET  /api/gallery');
      console.log('   GET  /api/reports');
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });
