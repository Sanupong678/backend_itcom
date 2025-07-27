const fs = require('fs');
const path = require('path');

// แปลงไฟล์รูปภาพเป็น Base64
const convertImageToBase64 = (filePath) => {
  try {
    const imageBuffer = fs.readFileSync(filePath);
    const base64String = imageBuffer.toString('base64');
    return `data:image/jpeg;base64,${base64String}`;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return null;
  }
};

// แปลง Base64 กลับเป็นไฟล์
const convertBase64ToFile = (base64String, outputPath) => {
  try {
    // ลบ data URL prefix ออก
    const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(outputPath, imageBuffer);
    return true;
  } catch (error) {
    console.error('Error converting base64 to file:', error);
    return false;
  }
};

// ตรวจสอบว่าเป็น Base64 string หรือไม่
const isBase64Image = (str) => {
  if (!str || typeof str !== 'string') return false;
  return str.startsWith('data:image/');
};

// บีบอัดรูปภาพก่อนแปลงเป็น Base64
const compressImage = (filePath, quality = 0.8) => {
  // ใช้ sharp หรือ jimp สำหรับบีบอัดรูปภาพ
  // ตัวอย่างนี้ใช้การบีบอัดแบบง่าย
  return filePath; // ต้องติดตั้ง sharp หรือ jimp เพิ่มเติม
};

// ตรวจสอบขนาดไฟล์
const checkFileSize = (filePath, maxSizeMB = 5) => {
  try {
    const stats = fs.statSync(filePath);
    const fileSizeInMB = stats.size / (1024 * 1024);
    return fileSizeInMB <= maxSizeMB;
  } catch (error) {
    console.error('Error checking file size:', error);
    return false;
  }
};

module.exports = {
  convertImageToBase64,
  convertBase64ToFile,
  isBase64Image,
  compressImage,
  checkFileSize
}; 