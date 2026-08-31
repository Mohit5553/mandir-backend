const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  key: { type: String, required: true },
  label: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { _id: false });

const timingSchema = new mongoose.Schema({
  label: { type: String, required: true },
  time: { type: String, required: true },
  note: { type: String, default: '' }
}, { _id: false });

const simpleCardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true }
}, { _id: false });

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, default: '' },
  message: { type: String, required: true }
}, { _id: false });

const timelineSchema = new mongoose.Schema({
  year: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true }
}, { _id: false });

const trustMessageSchema = new mongoose.Schema({
  author: { type: String, required: true },
  role: { type: String, default: '' },
  message: { type: String, required: true }
}, { _id: false });

const bhaktiTrackSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  audioUrl: { type: String, required: true },
  lyrics: { type: String, default: '' },
  enabled: { type: Boolean, default: true }
}, { _id: false });

const siteContentSchema = new mongoose.Schema({
  announcement: {
    enabled: { type: Boolean, default: true },
    text: { type: String, default: 'विशेष पूजा, धार्मिक अनुष्ठान, आगामी पर्व उत्सव एवं मंदिर ट्रस्ट की महत्वपूर्ण सूचनाएं।' }
  },
  sections: { type: [sectionSchema], default: [] },
  darshanTimings: { type: [timingSchema], default: [] },
  specialPoojaTimings: { type: [timingSchema], default: [] },
  festivalCountdown: {
    enabled: { type: Boolean, default: true },
    title: { type: String, default: 'आगामी प्रमुख धार्मिक उत्सव' },
    subtitle: { type: String, default: 'महाशिवरात्रि एवं आगामी पर्व की विशेष जानकारी यहाँ देखें।' },
    eventDate: { type: Date, default: null }
  },
  donationImpact: { type: [simpleCardSchema], default: [] },
  testimonials: { type: [testimonialSchema], default: [] },
  timeline: { type: [timelineSchema], default: [] },
  trustMessages: { type: [trustMessageSchema], default: [] },
  bhaktiTracks: { type: [bhaktiTrackSchema], default: [] },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SiteContent', siteContentSchema);
