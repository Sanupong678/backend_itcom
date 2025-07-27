const mongoose = require('mongoose');

const AdminProfileSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  age: { type: Number },
  nickname: { type: String },
  phone: { type: String },
  province: { type: String },
  detail: { type: String },
  facebook: { type: String },
  lineId: { type: String },
  imageUrls: [{ type: String }], // รองรับหลายรูป
  lineQrcodeText: { type: String }, // ข้อความ line
  qrcode: { type: String }, // path รูป QR code
  
  // เพิ่มฟิลด์สำหรับเก็บรูปภาพเป็น Base64
  imagesBase64: [{ type: String }], // Array of base64 images
  qrcodeBase64: { type: String }, // Base64 QR code
  // เพิ่มฟิลด์สำหรับระบุประเภทของรูปภาพ
  imageType: { 
    type: String, 
    enum: ['url', 'base64'], 
    default: 'url' 
  }
}, { timestamps: true });

// Virtual field สำหรับดึงรูปภาพ
AdminProfileSchema.virtual('displayImages').get(function() {
  if (this.imageType === 'base64' && this.imagesBase64 && this.imagesBase64.length > 0) {
    return this.imagesBase64;
  }
  return this.imageUrls || [];
});

// Virtual field สำหรับดึง QR code
AdminProfileSchema.virtual('displayQrcode').get(function() {
  if (this.imageType === 'base64' && this.qrcodeBase64) {
    return this.qrcodeBase64;
  }
  return this.qrcode;
});

// ตั้งค่าให้ virtual fields ถูก serialize
AdminProfileSchema.set('toJSON', { virtuals: true });
AdminProfileSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('AdminProfile', AdminProfileSchema); 