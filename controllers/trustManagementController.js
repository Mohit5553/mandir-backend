const TrustManagement = require('../models/TrustManagement');

const defaultCategories = [
  { key: 'office', name: 'Office Bearers', displayType: 'roleName', order: 1 },
  { key: 'supporting', name: 'सहयोगी सदस्य', displayType: 'namesOnly', order: 2 }
];

const defaultMembers = [
  { role: 'अध्यक्ष', name: 'सुनील मौर्य', category: 'office', order: 1 },
  { role: 'सचिव', name: 'मुकेश मौर्य', category: 'office', order: 2 },
  { role: 'मंत्री', name: 'रामकृष्ण पांडे', category: 'office', order: 3 },
  { role: 'व्यवस्थापक', name: 'रघुनाथ पंडित', category: 'office', order: 4 },
  { role: 'सहयोगी', name: 'इंद्राज वर्मा', category: 'office', order: 5 },
  { role: 'कोषाध्यक्ष', name: 'दिलीप कुमार मौर्य', category: 'office', order: 6 },
  { role: 'उपाध्यक्ष', name: 'रामजन्म पांडे', category: 'office', order: 7 },
  { role: 'संरक्षक', name: 'कप्तान मौर्य प्रधान', category: 'office', order: 8 },
  { role: 'लेखक', name: 'रघुनाथ पंडित', category: 'office', order: 9 }
];

const toKey = (name) => (
  String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `category-${Date.now()}`
);

const sortTrust = (trust) => {
  trust.categories.sort((a, b) => (a.order || 0) - (b.order || 0));
  trust.members.sort((a, b) => (a.order || 0) - (b.order || 0));
};

const ensureDefaults = async (trust) => {
  let changed = false;

  if (!Array.isArray(trust.categories) || trust.categories.length === 0) {
    trust.categories = defaultCategories;
    changed = true;
  }

  if (!Array.isArray(trust.members) || trust.members.length === 0) {
    trust.members = defaultMembers;
    changed = true;
  }

  for (const category of defaultCategories) {
    if (!trust.categories.some(item => item.key === category.key)) {
      trust.categories.push(category);
      changed = true;
    }
  }

  if (changed) {
    trust.updatedAt = Date.now();
    await trust.save();
  }
};

const getTrustDocument = async () => {
  let trust = await TrustManagement.findOne();
  if (!trust) {
    trust = await TrustManagement.create({
      categories: defaultCategories,
      members: defaultMembers
    });
  }
  await ensureDefaults(trust);
  sortTrust(trust);
  return trust;
};

exports.getTrustManagement = async (req, res) => {
  try {
    const trust = await getTrustDocument();
    res.status(200).json(trust);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addCategory = async (req, res) => {
  try {
    const trust = await getTrustDocument();
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ message: 'Category name is required' });

    let key = toKey(req.body.key || name);
    if (trust.categories.some(category => category.key === key)) {
      key = `${key}-${Date.now()}`;
    }

    trust.categories.push({
      key,
      name,
      displayType: req.body.displayType || 'roleName',
      order: Number(req.body.order) || 0
    });
    trust.updatedAt = Date.now();
    await trust.save();
    sortTrust(trust);

    res.status(201).json(trust);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const trust = await getTrustDocument();
    const category = trust.categories.id(req.params.categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    category.name = req.body.name || category.name;
    category.displayType = req.body.displayType || category.displayType;
    category.order = Number(req.body.order) || 0;
    trust.updatedAt = Date.now();
    await trust.save();
    sortTrust(trust);

    res.status(200).json(trust);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const trust = await getTrustDocument();
    const category = trust.categories.id(req.params.categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const hasMembers = trust.members.some(member => member.category === category.key);
    if (hasMembers) {
      return res.status(400).json({ message: 'Move or delete members in this category first' });
    }

    category.deleteOne();
    trust.updatedAt = Date.now();
    await trust.save();

    res.status(200).json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addMember = async (req, res) => {
  try {
    const trust = await getTrustDocument();
    trust.members.push(req.body);
    trust.updatedAt = Date.now();
    await trust.save();
    sortTrust(trust);

    res.status(201).json(trust);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateMember = async (req, res) => {
  try {
    const trust = await getTrustDocument();
    const member = trust.members.id(req.params.memberId);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    member.set(req.body);
    trust.updatedAt = Date.now();
    await trust.save();
    sortTrust(trust);

    res.status(200).json(trust);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteMember = async (req, res) => {
  try {
    const trust = await getTrustDocument();
    const member = trust.members.id(req.params.memberId);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    member.deleteOne();
    trust.updatedAt = Date.now();
    await trust.save();

    res.status(200).json({ message: 'Member deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
