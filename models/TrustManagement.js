const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  key: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  displayType: { type: String, enum: ['roleName', 'namesOnly'], default: 'roleName' },
  order: { type: Number, default: 0 }
});

const roleSchema = new mongoose.Schema({
  key: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  order: { type: Number, default: 0 }
});

const memberSchema = new mongoose.Schema({
  role: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, default: '', trim: true, lowercase: true },
  phone: { type: String, default: '', trim: true },
  photoUrl: { type: String, default: '' },
  joinDate: { type: Date },
  category: { type: String, required: true, trim: true, default: 'office' },
  order: { type: Number, default: 0 }
});

const trustManagementSchema = new mongoose.Schema({
  categories: [categorySchema],
  roles: [roleSchema],
  members: [memberSchema],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TrustManagement', trustManagementSchema);
