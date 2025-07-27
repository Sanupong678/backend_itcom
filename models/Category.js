const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  imageUrl: { 
    type: String, 
    default: null 
  },
  // เพิ่มฟิลด์สำหรับเก็บรูปภาพเป็น Base64
  imageBase64: { 
    type: String, 
    default: null 
  },
  // เพิ่มฟิลด์สำหรับระบุประเภทของรูปภาพ
  imageType: { 
    type: String, 
    enum: ['url', 'base64'], 
    default: 'url' 
  }
}, { timestamps: true });

// Virtual field สำหรับดึงรูปภาพ
categorySchema.virtual('image').get(function() {
  if (this.imageType === 'base64' && this.imageBase64) {
    return this.imageBase64;
  }
  return this.imageUrl;
});

// ตั้งค่าให้ virtual fields ถูก serialize
categorySchema.set('toJSON', { virtuals: true });
categorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Category', categorySchema);
