const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { sendContactMessageEmail } = require('../services/mailService');

// Submit contact form
router.post('/', async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();

    let contactEmail = null;
    try {
      contactEmail = await sendContactMessageEmail(contact);
    } catch (emailError) {
      console.error('Contact message saved, but email failed:', emailError.message);
      contactEmail = { sent: false, skipped: false, error: emailError.message };
    }

    res.status(201).json({
      message: 'Message received. We will contact you soon!',
      contactEmail
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all contact messages (Admin)
router.get('/', async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
