const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { sendContactMessageEmail } = require('../services/mailService');
const { verifyToken, requirePermission } = require('../middleware/authMiddleware');
const { contactRules } = require('../middleware/validationMiddleware');

// Submit contact form (Public)
router.post('/', contactRules, async (req, res) => {
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
router.get('/', verifyToken, requirePermission('Contact Messages', 'view'), async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle read status (Admin)
router.patch('/:id/read', verifyToken, requirePermission('Contact Messages', 'update'), async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Message not found' });
    contact.isRead = !contact.isRead;
    await contact.save();
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a contact message (Admin)
router.delete('/:id', verifyToken, requirePermission('Contact Messages', 'delete'), async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
