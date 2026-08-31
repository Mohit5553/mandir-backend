const express = require('express');
const router = express.Router();
const SiteContent = require('../models/SiteContent');
const { verifyToken, requirePermission } = require('../middleware/authMiddleware');
const { logAudit } = require('../services/auditService');

const defaultSections = [
  { key: 'announcement', label: 'सूचना पट्टी', enabled: true, order: 1 },
  { key: 'timings', label: 'दर्शन एवं आरती समय', enabled: true, order: 2 },
  { key: 'countdown', label: 'महोत्सव उलटी गिनती', enabled: true, order: 3 },
  { key: 'donationImpact', label: 'दान का प्रभाव', enabled: true, order: 4 },
  { key: 'galleryHighlights', label: 'गैलरी झलकियां', enabled: true, order: 5 },
  { key: 'transparency', label: 'पारदर्शी प्रबंधन', enabled: true, order: 6 },
  { key: 'volunteer', label: 'स्वयंसेवक पंजीकरण', enabled: true, order: 7 },
  { key: 'trustMessages', label: 'ट्रस्ट संदेश', enabled: true, order: 8 },
  { key: 'testimonials', label: 'श्रद्धालु अनुभव', enabled: true, order: 9 },
  { key: 'timeline', label: 'विकास यात्रा', enabled: true, order: 10 },
  { key: 'news', label: 'नवीनतम समाचार', enabled: true, order: 11 },
  { key: 'events', label: 'आगामी आयोजन', enabled: true, order: 12 },
  { key: 'management', label: 'ट्रस्ट प्रबंधन', enabled: true, order: 13 }
];

const defaultDarshanTimings = [
  { label: 'प्रातः दर्शन', time: 'प्रातः 05:00 - दोपहर 12:00', note: 'प्रातः मंगला आरती के साथ मंदिर के कपाट खुलते हैं' },
  { label: 'संध्या दर्शन', time: 'सायं 04:00 - रात्रि 09:00', note: 'सायंकालीन भव्य संध्या आरती एवं दर्शन' }
];

const defaultSpecialPoojaTimings = [
  { label: 'रुद्राभिषेक', time: 'प्रातः 07:00 बजे', note: 'विशेष संकल्प पूजा एवं बुकिंग पर उपलब्ध' },
  { label: 'महा आरती', time: 'सायं 07:30 बजे', note: 'दैनिक सायं भव्य महा आरती एवं संकीर्तन' }
];

const defaultDonationImpact = [
  { title: 'मंदिर जीर्णोद्धार एवं निर्माण', description: 'मंदिर परिसर के भव्य निर्माण एवं श्रद्धालुओं की सुविधाओं के विकास में सहयोग करें।' },
  { title: 'अन्नदान सेवा', description: 'श्रद्धालुओं एवं जरूरतमंदों के लिए दैनिक महाप्रसाद व भोजन व्यवस्था।' },
  { title: 'गौ सेवा (गौ संवर्धन)', description: 'गौ माता के चारे, रखरखाव और गौशाला सेवा में योगदान दें।' },
  { title: 'पर्व एवं उत्सव आयोजन', description: 'महाशिवरात्रि एवं सावन मेलों में विशेष धार्मिक व सांस्कृतिक आयोजन।' },
  { title: 'जनसेवा एवं सहायता', description: 'ट्रस्ट द्वारा संचालित सामाजिक व परोपकारी जनकल्याण कार्य।' }
];

const defaultTestimonials = [
  { name: 'भक्त परिवार', location: 'गोंडा', message: 'ट्रस्ट द्वारा मंदिर परिसर का वातावरण अत्यंत सुव्यवस्थित, पवित्र एवं भक्तिमय रखा जाता है।' },
  { name: 'श्रद्धालु दर्शनार्थी', location: 'करनैलगंज', message: 'अन्नदान और पूजा-आरती की व्यवस्था सदैव अत्यंत श्रद्धा व सम्मान के साथ की जाती है।' }
];

const defaultTimeline = [
  { year: 'पौराणिक धरोहर', title: 'निरंतर भक्ति एवं आराधना', description: 'मंदिर सदियों से जन-जन की आस्था और दैनिक शिव पूजा का पावन केंद्र रहा है।' },
  { year: 'ट्रस्ट स्थापना', title: 'सुव्यवस्थित प्रबंधन संरचना', description: 'पारदर्शिता, सेवा एवं सुचारू संचालन हेतु आधिकारिक ट्रस्ट की स्थापना की गई।' },
  { year: 'वर्तमान सेवा', title: 'धर्म एवं मानवता की सेवा', description: 'ट्रस्ट द्वारा दैनिक पूजा, अन्नदान, गौ सेवा और धार्मिक कार्यक्रमों का सफल संचालन।' }
];

const defaultTrustMessages = [
  { author: 'ट्रस्ट समिति', role: 'प्रबंधक मंडल', message: 'हम प्रत्येक श्रद्धालु का हृदय से स्वागत करते हैं और आप सभी को मंदिर ट्रस्ट के पावन सेवा कार्यों से जुड़ने के लिए आमंत्रित करते हैं।' }
];

const defaultBhaktiTracks = [
  {
    id: 'chalisa',
    title: 'श्री शिव चालीसा (Shree Shiv Chalisa)',
    subtitle: 'जय गणेश गिरिजा सुवन, मंगल मूल सुजान...',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    lyrics: `॥ दोहा ॥\nजय गणेश गिरिजा सुवन, मंगल मूल सुजान।\nकहत अयोध्यादास तुम, देहु अभय वरदान॥\n\n॥ चौपाई ॥\nजय गिरिजा पति दिन दयाला। सदा करत सन्तन प्रतिपाला॥\nभाल चंद्रमा सोहत नीके। कानन कुंडल नागफनी के॥\nअंग गौर शिर गंग बहाये। मुण्डमाल तन क्षार लगाये॥\nवस्त्र खाल बाघंबर सोहे। छवि को देखि नाग मुनि मोहे॥\nमैना मातु की हवे दुलारी। बाम अंग सोहत छवि न्यारी॥\nकर त्रिशूल सोहत छवि भारी। करत सदा शत्रुन क्षयकारी॥\nनंदि गणेश सोहैं तहँ कैसे। सागर मध्य कमल हैं जैसे॥\nकार्तिक श्याम और गणराऊ। या छवि को कहि जात न काऊ॥\nदेवन जबहीं जाय पुकारा। तबहीं दुख प्रभु आप निवारा॥\nकिया उपद्रव तारक भारी। देवन सब मिलि तुमहिं जुहारी॥\nतुरत षडानन आप पठायौ। लवनिमेष महँ मारि गिरायौ॥\nआप जलंधर असुर संहारा। सुयश तुम्हारा विदित संसारा॥\nत्रिपुरासुर सन युद्ध मचाई। सबहिं कृपा करि लीन्ह बचाई॥\nकिया तपहिं भागीरथ भारी। पुरब प्रतिज्ञा तासु पुरारी॥\nदानिन महँ तुम सम कोउ नाहीं। सेवक स्तुति करत सदाहीं॥\nवेद नाम महिमा तव गाई। अकथ अनादि भेद नहिं पाई॥\nप्रगट उदधि मंथन में ज्वाला। जरे सुरासुर भये विहाला॥\nकीन्ह दया तहँ करी सहाई। नीलकंठ तब नाम कहाई॥\nपूजन रामचंद्र जब कीन्हा। जीत के लंक विभीषण दीन्हा॥\nसहस कमल में होइ धारी। कीन्ह परीक्षा तबहिं पुरारी॥\nएक कमल प्रभु राखेउ गोई। कमल नयन पूजन चहं सोई॥\nकठिन भक्ति देखी प्रभु शंका। भये प्रसन्न दिए इच्छित अंका॥\nजय जय जय अनंत अविनाशी। करत कृपा सब के घट वासी॥\nदुष्ट सकल नित मोहि सतावैं। भ्रमते रहे मोहि चैन न आवै॥\nत्राहि त्राहि मैं नाथ पुकारो। यहि अवसर मोहि आन उबारो॥\nले त्रिशूल शत्रुन को मारो। संकट से मोहि आन उबारो॥\nमातु-पिता भ्राता सब कोई। संकट में पूछत नहिं कोई॥\nस्वामी एक है आस तुम्हारी। आय हरहु मम संकट भारी॥\nधन निर्धन को देत सदाहीं। जो कोई जांचे सो फल पाहीं॥\nअस्तुति केहि विधि करैं तुम्हारी। क्षमहु नाथ अब चूक हमारी॥\nशंकर हो संकट के नाशन। मंगल कारण विघ्न विनाशन॥\nयोगी यति मुनि ध्यान लगावैं। शारद नारद शीश नवावैं॥\nनमो नमो जय नमः शिवाय। सुर ब्रह्मादिक पार न पाय॥\nजो यह पाठ करे मन लाई। तापर होत शम्भु सुहाई॥\nरनियां जो कोई होइ अधिकारी। पाठ करे सो पावे सुख भारी॥\nपुत्र हीन कर इच्छा जोई। निश्चय शिव प्रसाद तेहि होई॥\nपंडित त्रयोदशी को लावे। ध्यान रात्रि मन सुस्थिर छावे॥\nधूप दीप नैवेद्य चढ़ावे। शंकर सम्मुख पाठ सुनावे॥\nजन्म जन्म के पाप नसावे। अंत धाम शिवपुर में पावे॥\nकहं अयोध्यादास आस तुम्हारी। जानि सकल दुःख हरहु पुरारी॥\n\n॥ दोहा ॥\nनित नेम करि प्रातः ही, पाठ करै चालीस।\nतुम ताके प्रभु सिद्ध करि, पूर्ण करहु जगदीश॥`
  },
  {
    id: 'mantra',
    title: 'महामृत्युंजय मंत्र 108 जाप (Mahamrityunjaya Mantra)',
    subtitle: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिबर्धनम्...',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    lyrics: `॥ महामृत्युंजय मंत्र ॥\n\nॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्।\nउर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात्॥\n\n॥ मंत्र का अर्थ ॥\nहम त्रिनेत्रधारी भगवान शिव की पूजा करते हैं, जो सुगंधित हैं और सभी प्राणियों का पोषण करते हैं। जैसे पका हुआ खरबूजा बेल के बंधन से मुक्त हो जाता है, वैसे ही हम मृत्यु से मुक्त होकर अमरता प्राप्त करें।`
  },
  {
    id: 'aarti',
    title: 'श्री शिव आरती - जय शिव ओंकारा (Shree Shiv Aarti)',
    subtitle: 'जय शिव ओंकारा, हर ॐ शिव ओंकारा...',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    lyrics: `॥ श्री शिव जी की आरती ॥\n\nजय शिव ओंकारा, हर ॐ शिव ओंकारा।\nब्रह्मा, विष्णु, सदाशिव, अर्द्धांगी धारा॥\nॐ जय शिव ओंकारा...\n\nएकानन चतुरानन पंचानन राजे।\nहंसासन गरुड़ासन वृषवाहन साजे॥\nॐ जय शिव ओंकारा...\n\nदो भुज चार चतुर्भुज दसभुज अति सोहे।\nत्रिगुण रूप निरखते त्रिभुवन जन मोहे॥\nॐ जय शिव ओंकारा...\n\nअक्षमाला वनमाला मुण्डमालाधारी।\nत्रिपुरारि कंसारि कर माला धारी॥\nॐ जय शिव ओंकारा...\n\nश्वेतांबर पीतांबर बाघंबर अंगे।\nसनकादिक गरुणादिक भूतादिक संगे॥\nॐ जय शिव ओंकारा...\n\nकर के मध्य कमंडल चक्र त्रिशूल धरता।\nजगकर्ता जगहर्ता जगपालनकर्ता॥\nॐ जय शिव ओंकारा...\n\nब्रह्मा विष्णु सदाशिव जानत अविवेका।\nप्रणवाक्षर के मध्ये ये तीनों एका॥\nॐ जय शिव ओंकारा...\n\nत्रिगुणस्वामी जी की आरती जो कोई नर गावे।\nकहत शिवानन्द स्वामी मनवांछित फल पावे॥\nॐ जय शिव ओंकारा...`
  },
  {
    id: 'dhun',
    title: 'ॐ नमः शिवाय धुन (Om Namah Shivaya Chanting)',
    subtitle: 'मधुर शिव धुन एवं ध्यान संगीत...',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    lyrics: `॥ ॐ नमः शिवाय ॥\n\nॐ नमः शिवाय! ॐ नमः शिवाय!\nहर हर भोले नमः शिवाय!\n\nरामेश्वरम शिव रामेश्वरम,\nहर हर भोले नमः शिवाय!\n\nगंगाधरम शिव गंगाधरम,\nहर हर भोले नमः शिवाय!\n\nसोमेश्वरम शिव सोमेश्वरम,\nहर हर भोले नमः शिवाय!\n\nविश्वेश्वरम शिव विश्वेश्वरम,\nहर हर भोले नमः शिवाय!`
  }
];

const getDefaultContent = () => ({
  announcement: {
    enabled: true,
    text: 'विशेष पूजा, धार्मिक अनुष्ठान, आगामी पर्व उत्सव एवं मंदिर ट्रस्ट की महत्वपूर्ण सूचनाएं।'
  },
  sections: defaultSections,
  darshanTimings: defaultDarshanTimings,
  specialPoojaTimings: defaultSpecialPoojaTimings,
  festivalCountdown: {
    enabled: true,
    title: 'आगामी प्रमुख धार्मिक उत्सव',
    subtitle: 'महाशिवरात्रि एवं आगामी पर्व की विशेष जानकारी यहाँ देखें।',
    eventDate: null
  },
  donationImpact: defaultDonationImpact,
  testimonials: defaultTestimonials,
  timeline: defaultTimeline,
  trustMessages: defaultTrustMessages,
  bhaktiTracks: defaultBhaktiTracks,
  updatedAt: Date.now()
});

const ensureContent = async () => {
  let content = await SiteContent.findOne();
  if (!content) {
    content = await SiteContent.create(getDefaultContent());
  } else {
    // If DB contains English defaults, auto-migrate them to Hindi
    let updated = false;
    if (!content.announcement?.text || content.announcement.text.includes('Special pooja')) {
      content.announcement = { enabled: true, text: 'विशेष पूजा, धार्मिक अनुष्ठान, आगामी पर्व उत्सव एवं मंदिर ट्रस्ट की महत्वपूर्ण सूचनाएं।' };
      updated = true;
    }
    if (!content.festivalCountdown?.title || content.festivalCountdown.title.includes('Next Major') || content.festivalCountdown.title.includes('Upcoming')) {
      content.festivalCountdown = {
        enabled: true,
        title: 'आगामी प्रमुख धार्मिक उत्सव',
        subtitle: 'महाशिवरात्रि एवं आगामी पर्व की विशेष जानकारी यहाँ देखें।',
        eventDate: content.festivalCountdown?.eventDate || null
      };
      updated = true;
    }
    if (!content.sections?.length || content.sections.some(s => s.label.includes('Announcement Bar') || s.label.includes('Darshan & Aarti'))) {
      content.sections = defaultSections;
      updated = true;
    }
    if (!content.darshanTimings?.length || content.darshanTimings.some(t => t.label.includes('Morning'))) {
      content.darshanTimings = defaultDarshanTimings;
      updated = true;
    }
    if (!content.specialPoojaTimings?.length || content.specialPoojaTimings.some(t => t.label.includes('Rudrabhishek') && t.note.includes('Available'))) {
      content.specialPoojaTimings = defaultSpecialPoojaTimings;
      updated = true;
    }
    if (!content.donationImpact?.length || content.donationImpact.some(i => i.title.includes('Temple Construction'))) {
      content.donationImpact = defaultDonationImpact;
      updated = true;
    }
    if (!content.testimonials?.length || content.testimonials.some(t => t.message.includes('welcoming'))) {
      content.testimonials = defaultTestimonials;
      updated = true;
    }
    if (!content.timeline?.length || content.timeline.some(t => t.year.includes('Traditional'))) {
      content.timeline = defaultTimeline;
      updated = true;
    }
    if (!content.trustMessages?.length || content.trustMessages.some(m => m.author.includes('Trust Committee') && m.message.includes('welcome'))) {
      content.trustMessages = defaultTrustMessages;
      updated = true;
    }
    if (!content.bhaktiTracks?.length || content.bhaktiTracks.some(t => !t.audioUrl || t.audioUrl.includes('pixabay.com'))) {
      content.bhaktiTracks = defaultBhaktiTracks;
      updated = true;
    }
    if (updated) {
      content.updatedAt = Date.now();
      await content.save();
    }
  }

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

const { uploadBase64Image } = require('../services/cloudinaryService');

// Protected route to update site content
router.put('/', verifyToken, requirePermission('Homepage Content', 'update'), async (req, res) => {
  try {
    const content = await ensureContent();
    const payload = { ...req.body };

    if (Array.isArray(payload.bhaktiTracks)) {
      payload.bhaktiTracks = await Promise.all(
        payload.bhaktiTracks.map(async (track) => {
          if (track.audioUrl && track.audioUrl.startsWith('data:')) {
            const savedUrl = await uploadBase64Image(track.audioUrl, 'audio');
            return { ...track, audioUrl: savedUrl };
          }
          return track;
        })
      );
    }

    content.set({
      ...payload,
      updatedAt: Date.now()
    });
    await content.save();

    await logAudit({
      req,
      action: 'SITE_CONTENT_UPDATE',
      details: { updatedFields: Object.keys(payload) }
    });

    res.json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
