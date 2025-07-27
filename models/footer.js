const mongoose = require('mongoose');

const footerSchema = new mongoose.Schema({
  contactItems: { type: Array, default: [] },
  aboutItems: { type: Array, default: [] },
  helpItems: { type: Array, default: [] },
  socialLinks: { type: Array, default: [] },
  copyright: { type: String, default: '' },
  aboutTitle: { type: String, default: '' },
  contactTitle: { type: String, default: '' },
  helpTitle: { type: String, default: '' }
});

footerSchema.statics.generateSampleData = function() {
  return {
    contactItems: [
      { icon: 'fas fa-phone', text: '099-999-9999' },
      { icon: 'fas fa-envelope', text: 'info@example.com' },
      { icon: 'fas fa-map-marker-alt', text: '123 Main St, Bangkok' }
    ],
    aboutItems: [
      { icon: 'fas fa-info-circle', text: 'เกี่ยวกับเรา' },
      { icon: 'fas fa-globe', text: 'เว็บไซต์ของเรา' }
    ],
    helpItems: [
      { icon: 'fas fa-question-circle', text: 'คำถามที่พบบ่อย' },
      { icon: 'fas fa-phone-volume', text: 'ติดต่อฝ่ายสนับสนุน' }
    ],
    socialLinks: [
      { icon: 'fab fa-facebook-f', text: 'Facebook', url: 'https://facebook.com' },
      { icon: 'fab fa-line', text: 'Line', url: 'https://line.me' },
      { icon: 'fab fa-instagram', text: 'Instagram', url: 'https://instagram.com' }
    ],
    copyright: '© 2024 ITCOM. สงวนลิขสิทธิ์ทุกประการ',
    aboutTitle: 'เกี่ยวกับ Website Card',
    contactTitle: 'ติดต่อเรา',
    helpTitle: 'ศูนย์ช่วยเหลือ'
  };
};

const Footer = mongoose.model('Footer', footerSchema, 'footer');

module.exports = Footer; 