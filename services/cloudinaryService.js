const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

const isConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('☁️ Cloudinary SDK configured successfully.');
} else {
  console.warn('⚠️ Cloudinary is not configured. Media storage will fall back to local mocks.');
}

/**
 * Uploads a base64 encoded image/video to Cloudinary.
 * If the input is already a URL, it is returned as-is.
 * If Cloudinary is not configured, it returns a mock URL.
 * 
 * @param {string} base64Str - The base64 data string (e.g. data:image/png;base64,...)
 * @param {string} folder - Destination folder on Cloudinary
 * @returns {Promise<string>} The secure URL of the uploaded asset
 */
const uploadBase64Image = async (base64Str, folder = 'temple_assets') => {
  if (!base64Str) return null;
  
  // If it's already a URL, return it directly
  if (base64Str.startsWith('http://') || base64Str.startsWith('https://') || base64Str.startsWith('/uploads/')) {
    return base64Str;
  }

  // Fallback if Cloudinary is not configured: save file locally
  if (!isConfigured) {
    try {
      const match = base64Str.match(/^data:(image|video|audio)\/([a-zA-Z0-9\+\-\.]+);base64,/);
      let ext = match ? match[2] : 'png';
      if (ext === 'mpeg' || ext === 'mp3') ext = 'mp3';
      const base64Data = base64Str.replace(/^data:(image|video|audio)\/[a-zA-Z0-9\+\-\.]+;base64,/, '');
      
      const targetDir = path.join(__dirname, '../public/uploads', folder);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = path.join(targetDir, fileName);
      fs.writeFileSync(filePath, base64Data, 'base64');
      
      console.log(`📁 Local storage saved: ${filePath}`);
      return `/uploads/${folder}/${fileName}`;
    } catch (err) {
      console.error('❌ Local file save failed:', err.message);
      const randomId = Math.random().toString(36).substring(2, 10);
      return `https://res.cloudinary.com/mock-cloud/image/upload/v1234567/${folder}/mock_image_${randomId}.png`;
    }
  }

  try {
    const uploadResponse = await cloudinary.uploader.upload(base64Str, {
      folder: folder,
      resource_type: 'auto'
    });
    return uploadResponse.secure_url;
  } catch (error) {
    console.error('❌ Cloudinary upload failed:', error.message);
    throw new Error(`Media upload failed: ${error.message}`);
  }
};

module.exports = { uploadBase64Image };
