const Gallery = require('../models/Gallery');

const defaultGalleryItems = [
  {
    title: 'श्री मन्वत बाबा मंदिर संध्या आरती',
    type: 'image',
    category: 'फोटो',
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop',
    featuredOnHome: true
  },
  {
    title: 'महाशिवरात्रि विशेष पूजन एवं दर्शन',
    type: 'image',
    category: 'फोटो',
    imageUrl: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800&auto=format&fit=crop',
    featuredOnHome: true
  },
  {
    title: 'मंदिर प्रांगण एवं जीर्णोद्धार कार्य',
    type: 'image',
    category: 'फोटो',
    imageUrl: 'https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?w=800&auto=format&fit=crop',
    featuredOnHome: true
  },
  {
    title: 'महाप्रसाद एवं अन्नदान सेवा',
    type: 'image',
    category: 'फोटो',
    imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop',
    featuredOnHome: true
  }
];

let isInitialCheckDone = false;

exports.getGalleryItems = async (req, res) => {
  try {
    if (!isInitialCheckDone) {
      isInitialCheckDone = true;
      const count = await Gallery.countDocuments();
      if (count === 0) {
        await Gallery.insertMany(defaultGalleryItems);
      }
    }

    const items = await Gallery.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addGalleryItem = async (req, res) => {
  try {
    const item = new Gallery(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateGalleryItem = async (req, res) => {
  try {
    const item = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteGalleryItem = async (req, res) => {
  try {
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
