const express = require('express');
const router = express.Router();
const carouselController = require('../controllers/carouselController');
const { verifyToken, requirePermission } = require('../middleware/authMiddleware');
const { handleBase64Upload } = require('../middleware/uploadMiddleware');

// Public route to view active carousel items
router.get('/', carouselController.getCarouselItems);

// Protected routes to manage carousel items
router.post('/', verifyToken, requirePermission('Home Carousel', 'create'), handleBase64Upload, carouselController.addCarouselItem);
router.put('/:id', verifyToken, requirePermission('Home Carousel', 'update'), handleBase64Upload, carouselController.updateCarouselItem);
router.delete('/:id', verifyToken, requirePermission('Home Carousel', 'delete'), carouselController.deleteCarouselItem);

module.exports = router;
