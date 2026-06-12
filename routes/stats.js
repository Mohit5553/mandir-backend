const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const User = require('../models/User');
const Event = require('../models/Event');
const News = require('../models/News');
const VisitorCount = require('../models/VisitorCount');

router.get('/dashboard', async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const startOfYear = new Date();
    startOfYear.setMonth(0, 1);
    startOfYear.setHours(0, 0, 0, 0);

    // Donations Stats (Only Approved)
    const allApprovedDonations = await Donation.find({ paymentStatus: 'Approved' });
    const totalDonations = allApprovedDonations.reduce((acc, d) => acc + d.amount, 0);

    const todayDonations = allApprovedDonations
      .filter(d => new Date(d.createdAt) >= startOfDay)
      .reduce((acc, d) => acc + d.amount, 0);

    const monthlyDonations = allApprovedDonations
      .filter(d => new Date(d.createdAt) >= startOfMonth)
      .reduce((acc, d) => acc + d.amount, 0);

    const yearlyDonations = allApprovedDonations
      .filter(d => new Date(d.createdAt) >= startOfYear)
      .reduce((acc, d) => acc + d.amount, 0);

    // Categories Breakdown
    const categories = ['General Donation', 'Construction Fund', 'Annadan', 'Gau Seva'];
    const categoryStats = categories.map(cat => {
      const filtered = allApprovedDonations.filter(d => d.category === cat);
      return {
        name: cat,
        amount: filtered.reduce((acc, d) => acc + d.amount, 0),
        count: filtered.length
      };
    });

    // Multi-Counts
    const userCount = await User.countDocuments();
    const newsCount = await News.countDocuments();
    const eventCount = await Event.countDocuments();
    const pendingDonationsCount = await Donation.countDocuments({ paymentStatus: 'Pending' });

    res.status(200).json({
      donations: { today: todayDonations, monthly: monthlyDonations, yearly: yearlyDonations, total: totalDonations },
      categories: categoryStats,
      counts: { users: userCount, news: newsCount, events: eventCount, pendingDonations: pendingDonationsCount }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

// @desc    Increment visitor count
// @route   POST /api/stats/visit
// @access  Public
router.post('/visit', async (req, res) => {
  try {
    let visitorStat = await VisitorCount.findOne();
    if (!visitorStat) {
      visitorStat = new VisitorCount({ count: 1 });
    } else {
      visitorStat.count += 1;
    }
    await visitorStat.save();
    res.status(200).json({ count: visitorStat.count });
  } catch (error) {
    res.status(500).json({ message: 'Error updating visitor count', error: error.message });
  }
});

// @desc    Get total visitor count
// @route   GET /api/stats/visitors
// @access  Public
router.get('/visitors', async (req, res) => {
  try {
    let visitorStat = await VisitorCount.findOne();
    res.status(200).json({ count: visitorStat ? visitorStat.count : 0 });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching visitor count', error: error.message });
  }
});

module.exports = router;
