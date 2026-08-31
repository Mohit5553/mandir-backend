const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { verifyToken, requirePermission } = require('../middleware/authMiddleware');
const { handleBase64Upload } = require('../middleware/uploadMiddleware');

// Public route to view events
router.get('/', eventController.getAllEvents);

// Protected routes to modify events
router.post('/', verifyToken, requirePermission('Events', 'create'), handleBase64Upload, eventController.createEvent);
router.put('/:id', verifyToken, requirePermission('Events', 'update'), handleBase64Upload, eventController.updateEvent);
router.delete('/:id', verifyToken, requirePermission('Events', 'delete'), eventController.deleteEvent);

module.exports = router;
