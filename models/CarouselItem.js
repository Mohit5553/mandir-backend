const mongoose = require('mongoose');

const carouselItemSchema = new mongoose.Schema({
  title: { type: String, default: 'Home Carousel Media' },
  mediaUrl: { type: String, required: true },
  mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

carouselItemSchema.pre('save', function setUpdatedAt() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('CarouselItem', carouselItemSchema);
