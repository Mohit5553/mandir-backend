const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const { verifyToken, requirePermission } = require('../middleware/authMiddleware');
const { handleBase64Upload } = require('../middleware/uploadMiddleware');
const { donationRules } = require('../middleware/validationMiddleware');

// Public endpoint for devotees to submit donations
router.post('/create-order', donationRules, handleBase64Upload, donationController.createOrder);

// Protected admin endpoints
router.get('/', verifyToken, requirePermission('Donations', 'view'), donationController.getDonations);
router.post('/admin-create', verifyToken, requirePermission('Donations', 'create'), handleBase64Upload, donationController.createAdminDonation);
router.patch('/status/:id', verifyToken, requirePermission('Donations', 'update'), donationController.updateStatus);
router.post('/:id/send-receipt', verifyToken, requirePermission('Donations', 'update'), donationController.sendReceipt);

module.exports = router;
