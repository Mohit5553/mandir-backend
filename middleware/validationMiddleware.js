const { body, validationResult } = require('express-validator');

/**
 * Common handler to process validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed', 
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })) 
    });
  }
  next();
};

const loginRules = [
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('phone').optional({ checkFalsy: true }).isMobilePhone().withMessage('Please provide a valid phone number'),
  validate
];

const donationRules = [
  body('name').trim().notEmpty().withMessage('Donor name is required'),
  body('phone').trim().notEmpty().withMessage('Mobile number is required').isLength({ min: 10, max: 15 }).withMessage('Phone number must be between 10 and 15 digits'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('amount').isNumeric().withMessage('Amount must be a numeric value').custom(val => Number(val) > 0).withMessage('Amount must be greater than zero'),
  body('category').trim().notEmpty().withMessage('Donation category is required').isIn(['General Donation', 'Construction Fund', 'Annadan', 'Gau Seva']).withMessage('Invalid donation category'),
  body('utr').optional({ checkFalsy: true }).trim().isLength({ min: 6 }).withMessage('UTR / Transaction ID must be at least 6 characters long'),
  validate
];

const contactRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('phone').optional({ checkFalsy: true }).trim().isLength({ min: 10, max: 15 }).withMessage('Phone number must be between 10 and 15 digits'),
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ min: 5 }).withMessage('Message must be at least 5 characters long'),
  validate
];

const reviewRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
  body('comment').trim().notEmpty().withMessage('Comment is required').isLength({ min: 2 }).withMessage('Comment must be at least 2 characters long'),
  validate
];

const userUpdateRules = [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('password').optional({ checkFalsy: true }).isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').optional().trim().notEmpty().withMessage('Role cannot be empty'),
  validate
];

const roleRules = [
  body('name').trim().notEmpty().withMessage('Role name is required'),
  validate
];

module.exports = {
  loginRules,
  registerRules,
  donationRules,
  contactRules,
  reviewRules,
  userUpdateRules,
  roleRules
};
