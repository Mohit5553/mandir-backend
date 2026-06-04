const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');

router.get('/', donationController.getDonations);
router.post('/create-order', donationController.createOrder);
router.post('/admin-create', donationController.createAdminDonation);
router.patch('/status/:id', donationController.updateStatus);
router.post('/:id/send-receipt', donationController.sendReceipt);

module.exports = router;
