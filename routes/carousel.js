const express = require('express');
const router = express.Router();
const carouselController = require('../controllers/carouselController');

router.get('/', carouselController.getCarouselItems);
router.post('/', carouselController.addCarouselItem);
router.put('/:id', carouselController.updateCarouselItem);
router.delete('/:id', carouselController.deleteCarouselItem);

module.exports = router;
