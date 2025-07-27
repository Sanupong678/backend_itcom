const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
   imageUrl: String,
   imageBase64: { type: String, default: null },
   imageType: { type: String, enum: ['url', 'base64'], default: 'url' },
   createdAt: { type: Date, default: Date.now }
});

// Virtual field
BannerSchema.virtual('image').get(function() {
  if (this.imageType === 'base64' && this.imageBase64) {
    return this.imageBase64;
  }
  return this.imageUrl;
});

BannerSchema.set('toJSON', { virtuals: true });
BannerSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Banner', BannerSchema);