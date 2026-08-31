const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const Event = require('../models/Event');
const News = require('../models/News');
const User = require('../models/User');
const { verifyToken, requirePermission } = require('../middleware/authMiddleware');

const DONATION_CATEGORIES = ['General Donation', 'Construction Fund', 'Annadan', 'Gau Seva'];
const PAYMENT_MODES = ['Cash', 'UPI'];
const DONATION_STATUSES = ['Approved', 'Pending', 'Rejected'];

router.get('/', verifyToken, requirePermission('Reports', 'view'), async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [allDonations, totalUsers, totalEvents, totalNews] = await Promise.all([
      Donation.find().sort({ createdAt: -1 }),
      User.countDocuments(),
      Event.countDocuments(),
      News.countDocuments()
    ]);

    const approvedDonations = allDonations.filter(donation => donation.paymentStatus === 'Approved');

    const sumAmounts = (items) => items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const filterSince = (items, start) => items.filter(item => new Date(item.createdAt) >= start);

    const totalAmount = sumAmounts(approvedDonations);
    const todayAmount = sumAmounts(filterSince(approvedDonations, startOfDay));
    const monthAmount = sumAmounts(filterSince(approvedDonations, startOfMonth));
    const yearAmount = sumAmounts(filterSince(approvedDonations, startOfYear));

    const paymentModeBreakdown = PAYMENT_MODES.map((mode) => {
      const modeDonations = approvedDonations.filter(donation => donation.paymentMode === mode);
      return {
        mode,
        total: sumAmounts(modeDonations),
        count: modeDonations.length
      };
    });

    const categoryBreakdown = DONATION_CATEGORIES.map((category) => {
      const categoryDonations = approvedDonations.filter(donation => donation.category === category);
      return {
        name: category,
        total: sumAmounts(categoryDonations),
        count: categoryDonations.length
      };
    });

    const statusBreakdown = DONATION_STATUSES.map((status) => {
      const statusDonations = allDonations.filter(donation => donation.paymentStatus === status);
      return {
        status,
        count: statusDonations.length,
        total: status === 'Approved' ? sumAmounts(statusDonations) : 0
      };
    });

    const monthlyTrend = Array.from({ length: 6 }, (_, index) => {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - (4 - index), 1);
      const monthDonations = approvedDonations.filter(donation => {
        const createdAt = new Date(donation.createdAt);
        return createdAt >= monthStart && createdAt < monthEnd;
      });

      return {
        label: monthStart.toLocaleString('en-IN', { month: 'short' }),
        total: sumAmounts(monthDonations),
        count: monthDonations.length
      };
    });

    const averageDonation = approvedDonations.length ? Math.round(totalAmount / approvedDonations.length) : 0;
    const largestDonation = approvedDonations.reduce((max, donation) => (
      Number(donation.amount) > Number(max.amount || 0) ? donation : max
    ), {});

    const topCategory = [...categoryBreakdown].sort((a, b) => b.total - a.total)[0] || { name: 'N/A', total: 0 };
    const latestApprovedDonation = approvedDonations[0] || null;
    const recentDonations = allDonations.slice(0, 6).map((donation) => ({
      _id: donation._id,
      name: donation.name,
      amount: donation.amount,
      category: donation.category,
      paymentMode: donation.paymentMode,
      paymentStatus: donation.paymentStatus,
      createdAt: donation.createdAt
    }));

    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });

    res.status(200).json({
      donations: {
        total: totalAmount,
        today: todayAmount,
        thisMonth: monthAmount,
        thisYear: yearAmount,
        approvedCount: approvedDonations.length,
        average: averageDonation,
        largest: {
          amount: Number(largestDonation.amount) || 0,
          donorName: largestDonation.name || '-'
        },
        latestApprovedAt: latestApprovedDonation?.createdAt || null,
        topCategory
      },
      breakdowns: {
        paymentModes: paymentModeBreakdown,
        categories: categoryBreakdown,
        statuses: statusBreakdown,
        monthlyTrend
      },
      counts: {
        users: totalUsers,
        newUsersThisMonth,
        events: totalEvents,
        news: totalNews,
        totalDonations: allDonations.length,
        pendingDonations: statusBreakdown.find(item => item.status === 'Pending')?.count || 0,
        rejectedDonations: statusBreakdown.find(item => item.status === 'Rejected')?.count || 0
      },
      recentDonations
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
