const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const Donation = require('../models/Donation');
const TrustManagement = require('../models/TrustManagement');
const DeviceToken = require('../models/DeviceToken');
const { sendNotificationEmail } = require('../services/mailService');
const { sendPushNotification } = require('../config/firebase');

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

// Register Device Token
router.post('/register-token', async (req, res) => {
  try {
    const { token, platform } = req.body;
    if (!token) return res.status(400).json({ message: 'Token is required' });
    
    let deviceToken = await DeviceToken.findOne({ token });
    if (!deviceToken) {
      deviceToken = new DeviceToken({ token, platform });
      await deviceToken.save();
    }
    
    res.status(200).json({ message: 'Token registered successfully', deviceToken });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send a notification
router.post('/', async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();

    // 1. Send Email Notification
    const recipients = await getRecipientEmails();
    let emailResult = null;

    try {
      emailResult = await sendNotificationEmail(notification, recipients);
    } catch (emailError) {
      console.error('Notification saved, but email failed:', emailError.message);
      emailResult = { sent: false, skipped: false, error: emailError.message, recipientCount: recipients.length };
    }
    
    // 2. Send Push Notification
    let pushResult = null;
    try {
      const deviceTokens = await DeviceToken.find().select('token');
      const tokens = deviceTokens.map(dt => dt.token);
      pushResult = await sendPushNotification(notification.title, notification.message, tokens);
    } catch (pushError) {
      console.error('Push notification error:', pushError.message);
      pushResult = { error: pushError.message };
    }

    res.status(201).json({
      message: 'Notification processed',
      notification,
      emailResult,
      pushResult
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
