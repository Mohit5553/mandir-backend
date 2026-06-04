const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { 
    type: String, 
    enum: ['General Donation', 'Construction Fund', 'Annadan', 'Gau Seva'],
    required: true
  },
  paymentStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  paymentMode: { type: String, enum: ['Cash', 'UPI'], default: 'UPI' },
  utr: { type: String },
  screenshot: { type: String },
  paymentId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Donation', donationSchema);
