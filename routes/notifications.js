const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const Donation = require('../models/Donation');
const TrustManagement = require('../models/TrustManagement');
const { sendNotificationEmail } = require('../services/mailService');

const getRecipientEmails = async () => {
  const donations = await Donation.find({ email: { $exists: true, $ne: '' } }).select('email');
  const trust = await TrustManagement.findOne().select('members.email');

  const donorEmails = donations.map(donation => donation.email);
  const trustEmails = (trust?.members || []).map(member => member.email);

  return [...new Set([...donorEmails, ...trustEmails]
    .map(email => String(email || '').trim().toLowerCase())
    .filter(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))];
};

// Get all notifications
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ sentAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send a notification
router.post('/', async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();

    const recipients = await getRecipientEmails();
    let emailResult = null;

    try {
      emailResult = await sendNotificationEmail(notification, recipients);
    } catch (emailError) {
      console.error('Notification saved, but email failed:', emailError.message);
      emailResult = { sent: false, skipped: false, error: emailError.message, recipientCount: recipients.length };
    }

    res.status(201).json({
      message: emailResult?.sent
        ? `Notification sent to ${emailResult.recipientCount} email recipients`
        : 'Notification saved, but email was not sent',
      notification,
      emailResult
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
