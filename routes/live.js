const express = require('express');
const router = express.Router();
const liveController = require('../controllers/liveController');
const { verifyToken, requirePermission } = require('../middleware/authMiddleware');

// Public endpoints
router.get('/status', liveController.getStreamStatus);
router.get('/chat', liveController.getChatHistory);

// Protected admin endpoints
router.post('/status', verifyToken, requirePermission('Live Stream', 'update'), liveController.updateStreamStatus);
router.delete('/chat', verifyToken, requirePermission('Live Stream', 'delete'), liveController.clearChatHistory);

module.exports = router;
