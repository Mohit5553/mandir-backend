const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');

// Get all donations (Admin)
router.get('/', async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 }).populate('userId', 'name email');
    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    // Simple mock stats for the dashboard, would ideally use MongoDB aggregation
    const donations = await Donation.find({ paymentStatus: 'Completed' });
    const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
    
    res.status(200).json({
      totalCount: donations.length,
      totalAmount: totalDonations
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create donation request (UTR manual flow)
router.post('/create-order', async (req, res) => {
  try {
    const { name, email, phone, amount, category, userId, utr } = req.body;
    
    const donation = new Donation({
      name, 
      email, 
      phone, 
      amount, 
      category, 
      userId,
      utr,
      paymentStatus: 'Pending'
    });
    
    await donation.save();
    
    res.status(201).json({ 
      message: 'Donation request submitted successfully', 
      donationId: donation._id, 
      amount: amount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify payment
router.post('/verify', async (req, res) => {
  try {
    const { donationId, paymentId } = req.body;
    
    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    
    donation.paymentStatus = 'Completed';
    donation.paymentId = paymentId;
    await donation.save();
    
    res.status(200).json({ message: 'Payment successful', donation });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update donation status (Admin/Trustee)
router.patch('/status/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const donation = await Donation.findByIdAndUpdate(req.params.id, { paymentStatus: status }, { new: true });
    res.status(200).json({ message: `Donation ${status}`, donation });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
