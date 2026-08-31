const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { verifyToken, requirePermission } = require('../middleware/authMiddleware');
const { handleBase64Upload } = require('../middleware/uploadMiddleware');

// Public route to view news
router.get('/', newsController.getAllNews);

// Protected routes to modify news
router.post('/', verifyToken, requirePermission('News', 'create'), handleBase64Upload, newsController.createNews);
router.put('/:id', verifyToken, requirePermission('News', 'update'), handleBase64Upload, newsController.updateNews);
router.delete('/:id', verifyToken, requirePermission('News', 'delete'), newsController.deleteNews);

module.exports = router;
