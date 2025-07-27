const express = require('express');
const router = express.Router();
const adminProfileController = require('../controllers/adminProfileController');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// รองรับอัปโหลดทั้ง images (array) และ qrcode (single file)
const profileUpload = upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'qrcode', maxCount: 1 }
]);

// เปลี่ยน GET profile ให้ public
router.get('/profile', adminProfileController.getProfile);
router.put('/profile', authMiddleware, profileUpload, adminProfileController.updateProfile);

module.exports = router; 