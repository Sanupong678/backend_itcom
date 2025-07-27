const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { convertImageToBase64, isBase64Image } = require('../utils/imageUtils');

// Helper function to check if image file exists
const checkImageExists = (imageUrl) => {
  if (!imageUrl) return false;
  const imagePath = path.join(__dirname, '..', imageUrl);
  return fs.existsSync(imagePath);
};

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/products';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('รองรับเฉพาะไฟล์รูปภาพเท่านั้น (jpeg, jpg, png, gif)'));
    }
  }
});

// GET all products
const getAllProducts = async (req, res) => {
  try {
    const { search } = req.query;
    let filter = {};
    if (search) {
      filter.nameproduct = { $regex: search, $options: 'i' }; // filter by nameproduct (case-insensitive)
    }
    const products = await Product.find(filter).populate('category', 'name');
    
    // Check and fix missing images
    const productsWithValidImages = products.map(product => {
      const productObj = product.toObject();
      
      // Check if using Base64 or URL
      if (productObj.imageType === 'base64' && productObj.imagesBase64 && productObj.imagesBase64.length > 0) {
        // Use Base64 directly - no need to check file existence
        return productObj;
      }
      
      // Fallback for URL-based images
      if (productObj.images && Array.isArray(productObj.images)) {
        productObj.images = productObj.images.filter(imageUrl => {
          const exists = checkImageExists(imageUrl);
          if (!exists) {
            console.log(`[${new Date().toISOString()}] Missing product image: ${imageUrl}`);
          }
          return exists;
        });
      }
      return productObj;
    });
    
    res.json(productsWithValidImages);
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้าทั้งหมด' });
  }
};

// GET products by category
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const products = await Product.find(filter).populate('category', 'name');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า' });
  }
};

// GET single product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');
    if (!product) {
      return res.status(404).json({ message: 'ไม่พบสินค้านี้' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า' });
  }
};

// POST create new product
const createProduct = async (req, res) => {
  try {
    const { nameproduct, price, category, subcategory, description, phone } = req.body;
    
    let imagesBase64 = [];
    let imageType = 'url';
    
    // Convert uploaded files to Base64
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const imagePath = path.join(__dirname, '..', 'uploads', 'products', file.filename);
        const imageBase64 = convertImageToBase64(imagePath);
        if (imageBase64) {
          imagesBase64.push(imageBase64);
        }
        // Delete temporary file
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      imageType = 'base64';
    }
    
    const product = new Product({
      nameproduct,
      price: parseFloat(price),
      category,
      subcategory,
      description,
      phone,
      imagesBase64,
      imageType
    });
    
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้างสินค้า' });
  }
};

// PUT update product
const updateProduct = async (req, res) => {
  try {
    const { nameproduct, price, category, subcategory, description, phone } = req.body;
    
    let imagesBase64 = [];
    let imageType = 'url';
    
    // Convert uploaded files to Base64
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const imagePath = path.join(__dirname, '..', 'uploads', 'products', file.filename);
        const imageBase64 = convertImageToBase64(imagePath);
        if (imageBase64) {
          imagesBase64.push(imageBase64);
        }
        // Delete temporary file
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      imageType = 'base64';
    }
    
    const updateData = {
      nameproduct,
      price: parseFloat(price),
      category,
      subcategory,
      description,
      phone,
      imageType
    };
    
    // If new images are uploaded, update the imagesBase64 array
    if (imagesBase64.length > 0) {
      updateData.imagesBase64 = imagesBase64;
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('category', 'name');
    
    if (!product) {
      return res.status(404).json({ message: 'ไม่พบสินค้านี้' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตสินค้า' });
  }
};

// DELETE product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'ไม่พบสินค้านี้' });
    }
    
    // Delete associated images from filesystem (only for URL-based images)
    if (product.imageType === 'url' && product.images && product.images.length > 0) {
      product.images.forEach(imagePath => {
        const fullPath = path.join(__dirname, '..', imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }
    
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'ลบสินค้าสำเร็จ' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบสินค้า' });
  }
};

// PATCH update product status
const updateProductStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['ปกติ', 'ขาย'].includes(status)) {
      return res.status(400).json({ message: 'Status ต้องเป็น "ปกติ" หรือ "ขาย"' });
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('category', 'name');
    
    if (!product) {
      return res.status(404).json({ message: 'ไม่พบสินค้านี้' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error updating product status:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะสินค้า' });
  }
};

module.exports = { 
  getAllProducts,
  getProductsByCategory, 
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  upload
}; 