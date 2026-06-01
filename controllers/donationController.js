const Donation = require('../models/Donation');

exports.getDonations = async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { name, amount, phone, category, utr } = req.body;
    const donation = new Donation({ name, amount, phone, category, utr, paymentStatus: 'Pending' });
    await donation.save();
    res.status(201).json(donation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const donation = await Donation.findByIdAndUpdate(req.params.id, { paymentStatus: status }, { new: true, returnDocument: 'after' });
    res.json(donation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
