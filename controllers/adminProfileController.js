const AdminProfile = require('../models/AdminProfile');
const path = require('path');
const fs = require('fs');
const { convertImageToBase64, isBase64Image } = require('../utils/imageUtils');

// Helper function to check if image file exists
const checkImageExists = (imageUrl) => {
  if (!imageUrl) return false;
  const imagePath = path.join(__dirname, '..', imageUrl);
  return fs.existsSync(imagePath);
};

exports.getProfile = async (req, res) => {
  try {
    let profile = await AdminProfile.findOne();
    if (!profile) {
      profile = await AdminProfile.create({ firstName: '', lastName: '' });
    }
    
    // Check and fix missing images
    const profileObj = profile.toObject();
    
    // ถ้าเป็น base64 ให้ใช้เลย
    if (profileObj.imageType === 'base64') {
      if (profileObj.imagesBase64 && Array.isArray(profileObj.imagesBase64)) {
        profileObj.displayImages = profileObj.imagesBase64;
      }
      if (profileObj.qrcodeBase64) {
        profileObj.displayQrcode = profileObj.qrcodeBase64;
      }
    } else {
      // ถ้าเป็น URL ให้ตรวจสอบไฟล์
      if (profileObj.imageUrls && Array.isArray(profileObj.imageUrls)) {
        profileObj.displayImages = profileObj.imageUrls.filter(imageUrl => {
          const exists = checkImageExists(imageUrl);
          if (!exists) {
            console.log(`[${new Date().toISOString()}] Missing admin profile image: ${imageUrl}`);
          }
          return exists;
        });
      }
      
      if (profileObj.qrcode && !checkImageExists(profileObj.qrcode)) {
        console.log(`[${new Date().toISOString()}] Missing admin profile QR code: ${profileObj.qrcode}`);
        profileObj.displayQrcode = null;
      } else {
        profileObj.displayQrcode = profileObj.qrcode;
      }
    }
    
    res.json(profileObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    console.log('BODY', req.body);
    console.log('FILES', req.files);
    let profile = await AdminProfile.findOne();
    if (!profile) {
      profile = new AdminProfile();
    }
    
    // handle images
    if (req.files && req.files.images && req.files.images.length > 0) {
      const imagesBase64 = [];
      for (const file of req.files.images) {
        const imagePath = path.join(__dirname, '..', 'uploads', file.filename);
        const imageBase64 = convertImageToBase64(imagePath);
        if (imageBase64) {
          imagesBase64.push(imageBase64);
        }
        // ลบไฟล์ชั่วคราว
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      if (imagesBase64.length > 0) {
        profile.imagesBase64 = imagesBase64;
        profile.imageType = 'base64';
      }
    }
    
    // handle qrcode
    if (req.files && req.files.qrcode && req.files.qrcode.length > 0) {
      const file = req.files.qrcode[0];
      const imagePath = path.join(__dirname, '..', 'uploads', file.filename);
      const qrcodeBase64 = convertImageToBase64(imagePath);
      if (qrcodeBase64) {
        profile.qrcodeBase64 = qrcodeBase64;
        profile.imageType = 'base64';
      }
      // ลบไฟล์ชั่วคราว
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // update fields
    profile.firstName = req.body.firstName;
    profile.lastName = req.body.lastName;
    profile.age = req.body.age;
    profile.nickname = req.body.nickname;
    profile.phone = req.body.phone;
    profile.province = req.body.province;
    profile.detail = req.body.detail;
    profile.facebook = req.body.facebook;
    profile.lineId = req.body.lineId;
    profile.lineQrcodeText = req.body.lineQrcodeText;
    
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error('UPDATE PROFILE ERROR:', err);
    res.status(500).json({ error: err.message });
  }
}; 