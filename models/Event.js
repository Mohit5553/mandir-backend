const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String },
  location: { type: String },
  imageUrl: { type: String },
  featuredOnHome: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);
