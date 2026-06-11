const mongoose = require('mongoose');

const liveStreamSchema = new mongoose.Schema({
  isLive: { type: Boolean, default: false },
  title: { type: String, default: 'Live Darshan' },
  description: { type: String, default: 'Live streaming from Shree Manvat Baba Mahashiv Mandir' },
  streamType: { type: String, enum: ['youtube', 'hls', 'webrtc', 'custom'], default: 'youtube' },
  streamUrl: { type: String, default: '' },
  isPaused: { type: Boolean, default: false },
  startedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LiveStream', liveStreamSchema);
