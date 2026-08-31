const { uploadBase64Image } = require('../services/cloudinaryService');

/**
 * Helper to determine if a string is a base64 Data URL
 */
const isBase64DataUrl = (str) => {
  if (!str || typeof str !== 'string') return false;
  return str.startsWith('data:') && str.includes(';base64,');
};

/**
 * Middleware that intercepts base64 images/videos, uploads them
 * to Cloudinary, and replaces the request body fields with secure URLs.
 */
const handleBase64Upload = async (req, res, next) => {
  try {
    // 1. Home Carousel (mediaUrl)
    if (isBase64DataUrl(req.body.mediaUrl)) {
      req.body.mediaUrl = await uploadBase64Image(req.body.mediaUrl, 'carousel');
    }

    // 2. Events & Gallery (imageUrl)
    if (isBase64DataUrl(req.body.imageUrl)) {
      const folder = req.baseUrl.includes('gallery') ? 'gallery' : 'events';
      req.body.imageUrl = await uploadBase64Image(req.body.imageUrl, folder);
    }

    // 3. Donations (screenshot)
    if (isBase64DataUrl(req.body.screenshot)) {
      req.body.screenshot = await uploadBase64Image(req.body.screenshot, 'donations');
    }

    // 4. News (images array)
    if (Array.isArray(req.body.images)) {
      const uploadedImages = [];
      for (const img of req.body.images) {
        if (isBase64DataUrl(img)) {
          const url = await uploadBase64Image(img, 'news');
          uploadedImages.push(url);
        } else {
          uploadedImages.push(img); // Keep existing URLs
        }
      }
      req.body.images = uploadedImages;
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Failed to process media upload', error: error.message });
  }
};

module.exports = { handleBase64Upload };
