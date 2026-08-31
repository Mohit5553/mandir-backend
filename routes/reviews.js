const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { verifyToken, requirePermission } = require('../middleware/authMiddleware');
const { reviewRules } = require('../middleware/validationMiddleware');

const rateLimit = require('express-rate-limit');
const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { message: 'Too many submissions, please try again after an hour.' }
});

// @desc    Create a new review (Requires Admin Approval)
// @route   POST /api/reviews
// @access  Public
router.post('/', formLimiter, reviewRules, async (req, res) => {
  try {
    const { name, rating, comment } = req.body;
    
    if (!name || !rating || !comment) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const review = new Review({
      name,
      rating,
      comment,
      isApproved: false // Submitted for Admin Approval
    });

    const createdReview = await review.save();
    res.status(201).json({ message: 'Thank you for your feedback! Your review has been submitted for approval.', review: createdReview });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get all approved reviews
// @route   GET /api/reviews
// @access  Public
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: true }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get all reviews (including unapproved)
// @route   GET /api/reviews/all
// @access  Private/Admin
router.get('/all', verifyToken, requirePermission('Reviews', 'view'), async (req, res) => {
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
router.put('/:id/approve', verifyToken, requirePermission('Reviews', 'update'), async (req, res) => {
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
router.delete('/:id', verifyToken, requirePermission('Reviews', 'delete'), async (req, res) => {
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
