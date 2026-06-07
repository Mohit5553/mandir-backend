const express = require('express');
const router = express.Router();
const Volunteer = require('../models/Volunteer');

router.get('/', async (req, res) => {
  try {
    const items = await Volunteer.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = new Volunteer(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const item = await Volunteer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Volunteer request not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
