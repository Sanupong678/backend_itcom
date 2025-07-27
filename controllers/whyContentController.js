const WhyContent = require('../models/whyContent');

// Get WhyContent (assume only one document)
exports.getWhyContent = async (req, res) => {
  try {
    let content = await WhyContent.findOne();
    if (!content) {
      // If not exist, create default
      content = await WhyContent.create({
        title: '💡 ทำไมต้องเลือกเรา?',
        subtitle: 'ข้อดีของการใช้ Website Card',
        description: 'ในยุคดิจิทัลทุกวันนี้ การขายของออนไลน์เป็นที่นิยมกว่าสมัยก่อน เพื่อช่วยให้เจ้าของสินค้าของร้านสามารถนำเสนอของที่ตนมีได้อย่างครบถ้วนและเป็นระบบ ไม่มีอะจะซ้ำกัน ลูกค้าก็สามารถดูรายละเอียดสินค้าได้ง่าย ๆ แค่สแกนหรือคลิก QR Code',
        features: [
          { icon: '🎨', text: 'ปรับแต่งเนื้อหาและรูปแบบได้ตามใจ' },
          { icon: '💬', text: 'ลูกค้าสามารถติดต่อเจ้าของร้านได้ทันที' },
          { icon: '💰', text: 'ไม่เสียค่าแพลตฟอร์มหรือค่าธรรมเนียมใด ๆ' }
        ]
      });
    }
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update WhyContent (color, color2, title, subtitle, description, features)
exports.updateWhyContent = async (req, res) => {
  try {
    const { color, color2, title, subtitle, description, features } = req.body;
    let content = await WhyContent.findOne();
    if (!content) {
      content = new WhyContent();
    }
    if (title !== undefined) content.title = title;
    if (subtitle !== undefined) content.subtitle = subtitle;
    if (color !== undefined) content.color = color;
    if (color2 !== undefined) content.color2 = color2;
    if (description !== undefined) content.description = description;
    if (features !== undefined) content.features = features;
    await content.save();
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a new feature
exports.addFeature = async (req, res) => {
  try {
    const { icon, text } = req.body;
    let content = await WhyContent.findOne();
    if (!content) {
      return res.status(404).json({ error: 'WhyContent not found' });
    }
    content.features.push({ icon, text });
    await content.save();
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a feature by index
exports.deleteFeature = async (req, res) => {
  try {
    const { index } = req.params;
    let content = await WhyContent.findOne();
    if (!content) {
      return res.status(404).json({ error: 'WhyContent not found' });
    }
    content.features.splice(index, 1);
    await content.save();
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 