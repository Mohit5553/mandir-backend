const express = require('express');
const router = express.Router();
const liveController = require('../controllers/liveController');

router.get('/status', liveController.getStreamStatus);
router.post('/status', liveController.updateStreamStatus);
router.get('/chat', liveController.getChatHistory);
router.delete('/chat', liveController.clearChatHistory);

module.exports = router;
