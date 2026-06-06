const CarouselItem = require('../models/CarouselItem');

exports.getCarouselItems = async (req, res) => {
  try {
    const filter = req.query.active === 'true' ? { isActive: true } : {};
    const items = await CarouselItem.find(filter).sort({ sortOrder: 1, createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addCarouselItem = async (req, res) => {
  try {
    if (!req.body.mediaUrl) {
      return res.status(400).json({ message: 'Please upload a photo or video.' });
    }

    const item = new CarouselItem(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCarouselItem = async (req, res) => {
  try {
    const item = await CarouselItem.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!item) return res.status(404).json({ message: 'Carousel item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCarouselItem = async (req, res) => {
  try {
    await CarouselItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Carousel item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
