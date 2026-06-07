const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: { type: String, default: 'Gallery Photo' },
  imageUrl: { type: String, required: true },  // Base64 or URL
  type: { type: String, enum: ['image', 'video'], default: 'image' },
  featuredOnHome: { type: Boolean, default: false },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Gallery', gallerySchema);
