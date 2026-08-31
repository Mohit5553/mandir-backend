const express = require('express');
const router = express.Router();
const SiteContent = require('../models/SiteContent');
const { verifyToken, requirePermission } = require('../middleware/authMiddleware');
const { logAudit } = require('../services/auditService');

const defaultSections = [
  { key: 'announcement', label: 'Announcement Bar', enabled: true, order: 1 },
  { key: 'timings', label: 'Darshan & Aarti Timings', enabled: true, order: 2 },
  { key: 'countdown', label: 'Festival Countdown', enabled: true, order: 3 },
  { key: 'donationImpact', label: 'Donation Impact', enabled: true, order: 4 },
  { key: 'galleryHighlights', label: 'Photo & Video Highlights', enabled: true, order: 5 },
  { key: 'transparency', label: 'Trust Transparency', enabled: true, order: 6 },
  { key: 'volunteer', label: 'Volunteer Registration', enabled: true, order: 7 },
  { key: 'trustMessages', label: 'Trust Updates', enabled: true, order: 8 },
  { key: 'testimonials', label: 'Testimonials', enabled: true, order: 9 },
  { key: 'timeline', label: 'Temple Timeline', enabled: true, order: 10 },
  { key: 'news', label: 'Featured News', enabled: true, order: 11 },
  { key: 'events', label: 'Featured Events', enabled: true, order: 12 },
  { key: 'management', label: 'Trust Management', enabled: true, order: 13 }
];

const defaultDarshanTimings = [
  { label: 'Morning Darshan', time: '05:00 AM - 12:00 PM', note: 'Temple opens with Mangala Aarti' },
  { label: 'Evening Darshan', time: '04:00 PM - 09:00 PM', note: 'Sandhya Aarti in the evening' }
];

const defaultSpecialPoojaTimings = [
  { label: 'Rudrabhishek', time: '07:00 AM', note: 'Available on special booking' },
  { label: 'Maha Aarti', time: '07:30 PM', note: 'Daily evening devotional prayer' }
];

const defaultDonationImpact = [
  { title: 'Temple Construction', description: 'Help maintain and improve the temple complex for devotees.' },
  { title: 'Annadan Seva', description: 'Support food distribution and prasadam for visitors and the needy.' },
  { title: 'Gau Seva', description: 'Contribute to cow care, fodder, and shelter service efforts.' },
  { title: 'Festival Arrangements', description: 'Support decorations, devotional events, and cultural gatherings.' },
  { title: 'Community Help', description: 'Assist trust-led outreach and compassionate local service.' }
];

const defaultTestimonials = [
  { name: 'Devotee Family', location: 'Gonda', message: 'The trust keeps the temple atmosphere welcoming, organized, and full of devotion.' },
  { name: 'Festival Visitor', location: 'Colonelganj', message: 'The Annadan and pooja arrangements are always handled with care and respect.' }
];

const defaultTimeline = [
  { year: 'Traditional Legacy', title: 'Temple Devotion Continues', description: 'The mandir remains a center of daily worship and local spiritual life.' },
  { year: 'Trust Formation', title: 'Management Structure Established', description: 'A formal trust structure supports transparency, care, and organized seva.' },
  { year: 'Today', title: 'Serving Through Faith & Seva', description: 'The trust continues temple activities, festivals, Annadan, and Gau Seva programs.' }
];

const defaultTrustMessages = [
  { author: 'Trust Committee', role: 'Management Team', message: 'We welcome every devotee with gratitude and invite all to stay connected with trust service activities.' }
];

const getDefaultContent = () => ({
  announcement: {
    enabled: true,
    text: 'Special pooja updates, festival notices, and trust announcements can be highlighted here.'
  },
  sections: defaultSections,
  darshanTimings: defaultDarshanTimings,
  specialPoojaTimings: defaultSpecialPoojaTimings,
  festivalCountdown: {
    enabled: true,
    title: 'Next Major Festival',
    subtitle: 'Highlight your most important upcoming event here.',
    eventDate: null
  },
  donationImpact: defaultDonationImpact,
  testimonials: defaultTestimonials,
  timeline: defaultTimeline,
  trustMessages: defaultTrustMessages,
  updatedAt: Date.now()
});

const ensureContent = async () => {
  let content = await SiteContent.findOne();
  if (!content) {
    content = await SiteContent.create(getDefaultContent());
  }

  if (!content.sections?.length) {
    content.sections = defaultSections;
  }
  if (!content.darshanTimings?.length) {
    content.darshanTimings = defaultDarshanTimings;
  }
  if (!content.specialPoojaTimings?.length) {
    content.specialPoojaTimings = defaultSpecialPoojaTimings;
  }
  if (!content.donationImpact?.length) {
    content.donationImpact = defaultDonationImpact;
  }
  if (!content.testimonials?.length) {
    content.testimonials = defaultTestimonials;
  }
  if (!content.timeline?.length) {
    content.timeline = defaultTimeline;
  }
  if (!content.trustMessages?.length) {
    content.trustMessages = defaultTrustMessages;
  }

  await content.save();
  return content;
};

// Public route to get site content
router.get('/', async (req, res) => {
  try {
    const content = await ensureContent();
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Protected route to update site content
router.put('/', verifyToken, requirePermission('Homepage Content', 'update'), async (req, res) => {
  try {
    const content = await ensureContent();
    content.set({
      ...req.body,
      updatedAt: Date.now()
    });
    await content.save();

    await logAudit({
      req,
      action: 'SITE_CONTENT_UPDATE',
      details: { updatedFields: Object.keys(req.body) }
    });

    res.json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
