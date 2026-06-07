const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, default: '' },
  sevaType: { type: String, required: true },
  availability: { type: String, default: '' },
  message: { type: String, default: '' },
  status: { type: String, enum: ['New', 'Contacted', 'Approved', 'Closed'], default: 'New' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Volunteer', volunteerSchema);
