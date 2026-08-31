const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String },
  userEmail: { type: String },
  action: { type: String, required: true, index: true },
  details: { type: mongoose.Schema.Types.Mixed }, // flexible object
  ipAddress: { type: String },
  timestamp: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
