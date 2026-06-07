const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  images: [{ type: String }],
  videos: [{ type: String }],
  featuredOnHome: { type: Boolean, default: false },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('News', newsSchema);
