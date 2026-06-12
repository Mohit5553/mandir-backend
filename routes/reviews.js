const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, rating, comment } = req.body;
    
    if (!name || !rating || !comment) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const review = new Review({
      name,
      rating,
      comment,
      isApproved: true // Auto-approved by default
    });

    const createdReview = await review.save();
    res.status(201).json(createdReview);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get all approved reviews
// @route   GET /api/reviews
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Sort by newest first
    const reviews = await Review.find({ isApproved: true }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get all reviews (including unapproved)
// @route   GET /api/reviews/all
// @access  Private/Admin
router.get('/all', async (req, res) => {
  try {
    const reviews = await Review.find({}).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Approve/Reject a review
// @route   PUT /api/reviews/:id/approve
// @access  Private/Admin
router.put('/:id/approve', async (req, res) => {
  try {
    const { isApproved } = req.body;
    const review = await Review.findById(req.params.id);
    
    if (review) {
      review.isApproved = isApproved;
      const updatedReview = await review.save();
      res.json(updatedReview);
    } else {
      res.status(404).json({ message: 'Review not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (review) {
      await Review.deleteOne({ _id: review._id });
      res.json({ message: 'Review removed' });
    } else {
      res.status(404).json({ message: 'Review not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
