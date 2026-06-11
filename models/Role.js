const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  menu: { type: String, required: true },    // e.g. 'News', 'Events', 'Donations'
  view:   { type: Boolean, default: false },
  create: { type: Boolean, default: false }, // can add new items
  update: { type: Boolean, default: false }, // can edit existing items
  delete: { type: Boolean, default: false }
}, { _id: false });

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  permissions: [permissionSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Role', roleSchema);
