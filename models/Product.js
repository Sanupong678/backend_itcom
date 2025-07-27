const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nameproduct: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subcategory: { type: String, required: true },
  description: { type: String, required: true },
  phone: { type: String, required: true },
  images: [{ type: String }], // Array of image URLs for multiple images
  // เพิ่มฟิลด์สำหรับเก็บรูปภาพเป็น Base64
  imagesBase64: [{ type: String }], // Array of base64 images
  // เพิ่มฟิลด์สำหรับระบุประเภทของรูปภาพ
  imageType: { 
    type: String, 
    enum: ['url', 'base64'], 
    default: 'url' 
  },
  // เพิ่มฟิลด์ status สำหรับสินค้า
  status: {
    type: String,
    enum: ['ปกติ', 'ขาย'],
    default: 'ปกติ'
  }
}, { timestamps: true });

// Virtual field สำหรับดึงรูปภาพ
productSchema.virtual('displayImages').get(function() {
  if (this.imageType === 'base64' && this.imagesBase64 && this.imagesBase64.length > 0) {
    return this.imagesBase64;
  }
  return this.images || [];
});

// ตั้งค่าให้ virtual fields ถูก serialize
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema); 