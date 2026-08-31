const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const User = require('../models/User');
const Event = require('../models/Event');
const News = require('../models/News');
const Volunteer = require('../models/Volunteer');
const Contact = require('../models/Contact');
const AuditLog = require('../models/AuditLog');
const VisitorCount = require('../models/VisitorCount');
const TrustManagement = require('../models/TrustManagement');
const Review = require('../models/Review');
const Gallery = require('../models/Gallery');
const CarouselItem = require('../models/CarouselItem');
const LiveStream = require('../models/LiveStream');
const { verifyToken, requirePermission } = require('../middleware/authMiddleware');

router.get('/dashboard', verifyToken, requirePermission('Dashboard', 'view'), async (req, res) => {
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

    // 6-Month Revenue Trends
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mIndex = d.getMonth();
      const year = d.getFullYear();
      const mStart = new Date(year, mIndex, 1);
      const mEnd = new Date(year, mIndex + 1, 0, 23, 59, 59);

      const mDonations = allApprovedDonations.filter(don => {
        const created = new Date(don.createdAt);
        return created >= mStart && created <= mEnd;
      });

      monthlyTrends.push({
        label: `${monthNames[mIndex]}`,
        amount: mDonations.reduce((sum, don) => sum + don.amount, 0),
        count: mDonations.length
      });
    }

    // Multi-Counts
    const userCount = await User.countDocuments();
    const newsCount = await News.countDocuments();
    const eventCount = await Event.countDocuments();
    const pendingDonationsCount = await Donation.countDocuments({ paymentStatus: 'Pending' });
    const volunteerCount = await Volunteer.countDocuments();
    const contactCount = await Contact.countDocuments();
    const pendingReviewsCount = await Review.countDocuments({ isApproved: false });
    const trustMemberCount = await TrustManagement.countDocuments();
    const galleryCount = await Gallery.countDocuments();
    const carouselCount = await CarouselItem.countDocuments();
    const liveStream = await LiveStream.findOne();
    const isLiveNow = liveStream ? liveStream.isLive : false;

    let visitorStat = await VisitorCount.findOne();
    const totalVisitors = visitorStat ? visitorStat.count : 0;

    // Top Donors (Leaderboard)
    const topDonors = await Donation.find({ paymentStatus: 'Approved' }).sort({ amount: -1 }).limit(5).select('donorName amount category createdAt utr');

    // Upcoming Events
    const upcomingEvents = await Event.find().sort({ createdAt: -1 }).limit(3).select('title date time location image');

    // Recent Feed Records
    const recentLogs = await AuditLog.find().sort({ createdAt: -1 }).limit(5);
    const recentDonations = await Donation.find({ paymentStatus: 'Approved' }).sort({ createdAt: -1 }).limit(5).select('donorName amount category createdAt paymentStatus utr');
    const recentVolunteers = await Volunteer.find().sort({ createdAt: -1 }).limit(4).select('fullName phone status createdAt');
    const recentContacts = await Contact.find().sort({ createdAt: -1 }).limit(4).select('name email subject createdAt');

    // Payment Methods Breakdown
    const upiDonations = allApprovedDonations.filter(d => d.paymentMethod === 'UPI' || !d.paymentMethod);
    const bankDonations = allApprovedDonations.filter(d => d.paymentMethod === 'Bank Transfer' || d.utr);
    const cashDonations = allApprovedDonations.filter(d => d.paymentMethod === 'Cash');

    const paymentMethods = [
      { name: 'UPI / Online QR', amount: upiDonations.reduce((a, b) => a + b.amount, 0), count: upiDonations.length, color: '#FF6B00' },
      { name: 'Bank Transfer / UTR', amount: bankDonations.reduce((a, b) => a + b.amount, 0), count: bankDonations.length, color: '#2563eb' },
      { name: 'Direct Cash / Counter', amount: cashDonations.reduce((a, b) => a + b.amount, 0), count: cashDonations.length, color: '#16a34a' }
    ];

    res.status(200).json({
      donations: { today: todayDonations, monthly: monthlyDonations, yearly: yearlyDonations, total: totalDonations },
      categories: categoryStats,
      monthlyTrends,
      paymentMethods,
      topDonors,
      upcomingEvents,
      recentLogs,
      recentDonations,
      recentVolunteers,
      recentContacts,
      counts: {
        users: userCount,
        news: newsCount,
        events: eventCount,
        pendingDonations: pendingDonationsCount,
        volunteers: volunteerCount,
        contacts: contactCount,
        visitors: totalVisitors,
        pendingReviews: pendingReviewsCount,
        trustMembers: trustMemberCount,
        gallery: galleryCount,
        carousel: carouselCount,
        isLiveNow
      }
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
