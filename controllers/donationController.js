const Donation = require('../models/Donation');
const { sendDonationReceiptEmail } = require('../services/mailService');

const sendReceiptIfApproved = async (donation) => {
  if (!donation || donation.paymentStatus !== 'Approved') return null;

  try {
    return await sendDonationReceiptEmail(donation);
  } catch (error) {
    console.error('Donation approved, but receipt email failed:', error.message);
    return { sent: false, skipped: false, error: error.message };
  }
};

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
    const { name, email, amount, phone, category, utr, screenshot } = req.body;
    const donation = new Donation({ name, email, amount, phone, category, utr, screenshot, paymentMode: 'UPI', paymentStatus: 'Pending' });
    await donation.save();
    res.status(201).json(donation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createAdminDonation = async (req, res) => {
  try {
    const { name, email, amount, phone, category, utr, screenshot, paymentMode } = req.body;
    const donation = new Donation({
      name,
      email,
      amount,
      phone,
      category,
      utr: paymentMode === 'UPI' ? utr : '',
      screenshot,
      paymentMode,
      paymentStatus: 'Approved'
    });
    await donation.save();
    const receiptEmail = await sendReceiptIfApproved(donation);
    res.status(201).json({ ...donation.toObject(), receiptEmail });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const existingDonation = await Donation.findById(req.params.id);

    if (!existingDonation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    const previousStatus = existingDonation.paymentStatus;
    existingDonation.paymentStatus = status;
    const donation = await existingDonation.save();
    const becameApproved = status === 'Approved' && previousStatus !== 'Approved';
    const receiptEmail = becameApproved ? await sendReceiptIfApproved(donation) : null;

    res.json({ ...donation.toObject(), receiptEmail });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendReceipt = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.paymentStatus !== 'Approved') {
      return res.status(400).json({ message: 'Receipt can be sent only for approved donations.' });
    }

    const receiptEmail = await sendReceiptIfApproved(donation);
    res.json({
      message: receiptEmail?.sent ? 'Receipt email sent successfully.' : 'Receipt email was not sent.',
      receiptEmail
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
