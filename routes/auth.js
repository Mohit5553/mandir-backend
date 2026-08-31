const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { verifyToken, requirePermission } = require('../middleware/authMiddleware');
const { loginRules, registerRules, userUpdateRules } = require('../middleware/validationMiddleware');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});

router.post('/register', authLimiter, registerRules, authController.register);
router.post('/login', authLimiter, loginRules, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);

// Protected routes
router.get('/', verifyToken, requirePermission('Users', 'view'), authController.getAllUsers);
router.patch('/users/:id', verifyToken, requirePermission('Users', 'update'), userUpdateRules, authController.updateUser);
router.delete('/users/:id', verifyToken, requirePermission('Users', 'delete'), authController.deleteUser);
router.get('/audit-logs', verifyToken, requirePermission('Audit Logs', 'view'), authController.getAuditLogs);

module.exports = router;
