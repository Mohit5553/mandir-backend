const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const Event = require('../models/Event');
const News = require('../models/News');
const User = require('../models/User');

// Full Reports API
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const donationsCompleted = await Donation.find({ paymentStatus: 'Completed' });

    const totalAmount = donationsCompleted.reduce((sum, d) => sum + d.amount, 0);
    const todayAmount = donationsCompleted
      .filter(d => d.createdAt >= startOfDay)
      .reduce((sum, d) => sum + d.amount, 0);
    const monthAmount = donationsCompleted
      .filter(d => d.createdAt >= startOfMonth)
      .reduce((sum, d) => sum + d.amount, 0);
    const yearAmount = donationsCompleted
      .filter(d => d.createdAt >= startOfYear)
      .reduce((sum, d) => sum + d.amount, 0);

    // Category breakdown
    const categories = ['General Donation', 'Construction Fund', 'Annadan', 'Gau Seva'];
    const categoryBreakdown = {};
    for (const cat of categories) {
      const catDonations = donationsCompleted.filter(d => d.category === cat);
      categoryBreakdown[cat] = {
        count: catDonations.length,
        total: catDonations.reduce((sum, d) => sum + d.amount, 0)
      };
    }

    const totalUsers = await User.countDocuments({ role: 'Devotee' });
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });
    const totalEvents = await Event.countDocuments();
    const totalNews = await News.countDocuments();

    res.status(200).json({
      donations: {
        total: totalAmount,
        today: todayAmount,
        thisMonth: monthAmount,
        thisYear: yearAmount,
        count: donationsCompleted.length,
        categoryBreakdown
      },
      users: { total: totalUsers, newThisMonth: newUsersThisMonth },
      events: { total: totalEvents },
      news: { total: totalNews }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
