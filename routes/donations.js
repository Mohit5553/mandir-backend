const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');

router.get('/', donationController.getDonations);
router.post('/create-order', donationController.createOrder);
router.patch('/status/:id', donationController.updateStatus);

module.exports = router;
