const mongoose = require('mongoose');

const WhyFeatureSchema = new mongoose.Schema({
  icon: { type: String, required: true },
  text: { type: String, required: true }
});

const WhyContentSchema = new mongoose.Schema({
  title: { type: String, default: '💡 ทำไมต้องเลือกเรา?' },
  subtitle: { type: String, default: 'ข้อดีของการใช้ Website Card' },
  color: { type: String, default: '#f8f9fd' },
  color2: { type: String, default: '' },
  description: { type: String, required: true },
  features: [WhyFeatureSchema]
});

module.exports = mongoose.model('WhyContent', WhyContentSchema); 