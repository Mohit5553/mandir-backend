const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');

router.get('/', galleryController.getGalleryItems);
router.post('/', galleryController.addGalleryItem);
router.delete('/:id', galleryController.deleteGalleryItem);

module.exports = router;
