const dotenv = require('dotenv');
const mongoose = require('mongoose');
const TrustManagement = require('./models/TrustManagement');

dotenv.config();

const categories = [
  { key: 'office', name: 'Office Bearers', displayType: 'roleName', order: 1 },
  { key: 'supporting', name: 'सहयोगी सदस्य', displayType: 'namesOnly', order: 2 }
];

const officeMembers = [
  { role: 'अध्यक्ष', name: 'सुनील मौर्य', category: 'office', order: 1 },
  { role: 'सचिव', name: 'मुकेश मौर्य', category: 'office', order: 2 },
  { role: 'मंत्री', name: 'रामकरण पांडे', category: 'office', order: 3 },
  { role: 'व्यवस्थापक', name: 'रघुवाच पंडित', category: 'office', order: 4 },
  { role: 'सहयोगी', name: 'इरजाद वर्मी', category: 'office', order: 5 },
  { role: 'कोषाध्यक्ष', name: 'दिलीप कुमार मौर्य', category: 'office', order: 6 },
  { role: 'उपाध्यक्ष', name: 'राजनन्द पांडे', category: 'office', order: 7 },
  { role: 'संरक्षक', name: 'कप्तान मौर्य प्रधान', category: 'office', order: 8 },
  { role: 'लेखक', name: 'रुधनाथ पंडित', category: 'office', order: 9 }
];

const supportingNames = [
  'विनोद केवट वर्मी',
  'संजय पांडे',
  'बाबू पांडे',
  'आशीष मौर्य',
  'प्रकाश वर्मा',
  'संतोष चौहान',
  'दीपक मौर्य',
  'ननकू प्रजापति',
  'विमललाल गौतम',
  'प्रदीप पांडे',
  'राजेश निषाद',
  'दीपक सोनी',
  'ननकू प्रजापति',
  'करनैलगंज रविंद्र वर्मा',
  'रमेश वर्मा',
  'अवधेश चौहान',
  'आशीष सोनी',
  'कन्या चौहान',
  'राजू सिंह',
  'दिनेश सोनी',
  'छक्की मौर्य'
];

const members = [
  ...officeMembers,
  ...supportingNames.map((name, index) => ({
    role: 'सहयोगी सदस्य',
    name,
    category: 'supporting',
    order: index + 1
  }))
];

const seedTrustManagement = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/temple-trust');

  const existing = await TrustManagement.findOne();
  if (existing) {
    existing.categories = categories;
    existing.members = members;
    existing.updatedAt = Date.now();
    await existing.save();
  } else {
    await TrustManagement.create({ categories, members });
  }

  console.log(`Seeded ${members.length} trust management members.`);
  await mongoose.disconnect();
};

seedTrustManagement().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
