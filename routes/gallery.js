const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const { verifyToken, requirePermission } = require('../middleware/authMiddleware');
const { handleBase64Upload } = require('../middleware/uploadMiddleware');

// Public route to view gallery
router.get('/', galleryController.getGalleryItems);

// Protected routes to modify gallery
router.post('/', verifyToken, requirePermission('Gallery', 'create'), handleBase64Upload, galleryController.addGalleryItem);
router.put('/:id', verifyToken, requirePermission('Gallery', 'update'), handleBase64Upload, galleryController.updateGalleryItem);
router.delete('/:id', verifyToken, requirePermission('Gallery', 'delete'), galleryController.deleteGalleryItem);

module.exports = router;
