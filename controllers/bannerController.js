const Banner = require('../models/Banner');
const path = require('path');
const fs = require('fs');
const { convertImageToBase64, isBase64Image } = require('../utils/imageUtils');

function logError(context, err, req) {
  console.error(`[${new Date().toISOString()}] [Banner] ${context} Error:`);
  if (req) {
    console.error('  req.body:', req.body);
    console.error('  req.file:', req.file);
  }
  console.error('  error:', err);
  if (err && err.stack) console.error('  stack:', err.stack);
}

// Helper function to check if image file exists
const checkImageExists = (imageUrl) => {
  if (!imageUrl) return false;
  const imagePath = path.join(__dirname, '..', imageUrl);
  return fs.existsSync(imagePath);
};

// อัปโหลด banner ใหม่
exports.createBanner = async (req, res) => {
  try {
    console.log('[Banner] createBanner req.body:', req.body);
    console.log('[Banner] createBanner req.file:', req.file);
    const { title, description } = req.body;
    
    let imageBase64 = null;
    let imageType = 'url';
    
    if (req.file) {
      const imagePath = path.join(__dirname, '..', 'uploads', req.file.filename);
      imageBase64 = convertImageToBase64(imagePath);
      if (!imageBase64) {
        return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการประมวลผลรูปภาพ' });
      }
      imageType = 'base64';
      
      // Delete temporary file
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    const banner = new Banner({ 
      title, 
      description, 
      imageBase64,
      imageType
    });
    await banner.save();
    console.log('[Banner] Created:', banner);
    res.json(banner);
  } catch (err) {
    logError('Create', err, req);
    res.status(500).json({ error: 'Failed to create banner', details: err.message });
  }
};

// ดึง banner ล่าสุด
exports.getBanner = async (req, res) => {
  try {
    const banner = await Banner.findOne().sort({ createdAt: -1 });
    
    if (banner) {
      const bannerObj = banner.toObject();
      
      // Check image type and handle accordingly
      if (bannerObj.imageType === 'base64' && bannerObj.imageBase64) {
        // Use base64 directly
        bannerObj.image = bannerObj.imageBase64;
      } else if (bannerObj.imageUrl && !checkImageExists(bannerObj.imageUrl)) {
        console.log(`[${new Date().toISOString()}] Missing banner image: ${bannerObj.imageUrl}`);
        bannerObj.imageUrl = null;
      }
      
      console.log('[Banner] Fetched:', bannerObj);
      res.json(bannerObj);
    } else {
      res.json(null);
    }
  } catch (err) {
    logError('Fetch', err, req);
    res.status(500).json({ error: 'Failed to fetch banner', details: err.message });
  }
};

// แก้ไข banner
exports.updateBanner = async (req, res) => {
  try {
    console.log('[Banner] updateBanner req.body:', req.body);
    console.log('[Banner] updateBanner req.file:', req.file);
    const { id } = req.params;
    const { title, description } = req.body;
    
    let imageBase64 = null;
    let imageType = 'url';
    
    if (req.file) {
      const imagePath = path.join(__dirname, '..', 'uploads', req.file.filename);
      imageBase64 = convertImageToBase64(imagePath);
      if (!imageBase64) {
        return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการประมวลผลรูปภาพ' });
      }
      imageType = 'base64';
      
      // Delete temporary file
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    const updateData = { title, description, imageType };
    if (imageBase64) {
      updateData.imageBase64 = imageBase64;
    }
    
    const banner = await Banner.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    console.log('[Banner] Updated:', banner);
    res.json(banner);
  } catch (err) {
    logError('Update', err, req);
    res.status(500).json({ error: 'Failed to update banner', details: err.message });
  }
};