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

const siteContentSchema = new mongoose.Schema({
  announcement: {
    enabled: { type: Boolean, default: true },
    text: { type: String, default: 'Special pooja updates and trust announcements will appear here.' }
  },
  sections: { type: [sectionSchema], default: [] },
  darshanTimings: { type: [timingSchema], default: [] },
  specialPoojaTimings: { type: [timingSchema], default: [] },
  festivalCountdown: {
    enabled: { type: Boolean, default: true },
    title: { type: String, default: 'Upcoming Festival' },
    subtitle: { type: String, default: 'Stay connected with the next major trust event.' },
    eventDate: { type: Date, default: null }
  },
  donationImpact: { type: [simpleCardSchema], default: [] },
  testimonials: { type: [testimonialSchema], default: [] },
  timeline: { type: [timelineSchema], default: [] },
  trustMessages: { type: [trustMessageSchema], default: [] },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SiteContent', siteContentSchema);
