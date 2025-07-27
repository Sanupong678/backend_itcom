const Category = require('../models/Category');
const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');
const { convertImageToBase64, isBase64Image } = require('../utils/imageUtils');

// Helper function to check if image file exists
const checkImageExists = (imageUrl) => {
  if (!imageUrl) return false;
  const imagePath = path.join(__dirname, '..', imageUrl);
  return fs.existsSync(imagePath);
};

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] GET /api/categories - Fetching all categories`);
    
    const categories = await Category.find().sort({ createdAt: -1 });
    
    // Check and fix missing images
    const categoriesWithValidImages = categories.map(category => {
      const categoryObj = category.toObject();
      
      // ถ้าเป็น base64 ให้ใช้เลย
      if (categoryObj.imageType === 'base64' && categoryObj.imageBase64) {
        return categoryObj;
      }
      
      // ถ้าเป็น URL ให้ตรวจสอบไฟล์
      if (!checkImageExists(categoryObj.imageUrl)) {
        console.log(`[${new Date().toISOString()}] Missing image for category: ${categoryObj.name}, URL: ${categoryObj.imageUrl}`);
        categoryObj.imageUrl = null;
      }
      return categoryObj;
    });
    
    console.log(`[${new Date().toISOString()}] Successfully fetched ${categories.length} categories`);
    res.json(categoriesWithValidImages);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching categories:`, error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายการ' });
  }
};

// Create new category
const createCategory = async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] POST /api/categories - Creating new category`);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    const { name } = req.body;
    
    if (!name || !name.trim()) {
      console.log(`[${new Date().toISOString()}] Validation error: Name is required`);
      return res.status(400).json({ message: 'กรุณาใส่ชื่อรายการ' });
    }

    if (!req.file) {
      console.log(`[${new Date().toISOString()}] Validation error: Image is required`);
      return res.status(400).json({ message: 'กรุณาเลือกรูปภาพ' });
    }

    // แปลงรูปภาพเป็น Base64
    const imagePath = path.join(__dirname, '..', 'uploads', req.file.filename);
    const imageBase64 = convertImageToBase64(imagePath);
    
    if (!imageBase64) {
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการประมวลผลรูปภาพ' });
    }

    const category = new Category({
      name: name.trim(),
      imageBase64: imageBase64,
      imageType: 'base64'
    });

    await category.save();
    
    // ลบไฟล์ชั่วคราว
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    
    console.log(`[${new Date().toISOString()}] Successfully created category:`, category);
    res.status(201).json(category);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error creating category:`, error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่มรายการ' });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[${new Date().toISOString()}] DELETE /api/categories/${id} - Deleting category`);

    const category = await Category.findById(id);
    
    if (!category) {
      console.log(`[${new Date().toISOString()}] Category not found with id: ${id}`);
      return res.status(404).json({ message: 'ไม่พบรายการที่ต้องการลบ' });
    }

    // ลบ product ทั้งหมดที่อยู่ใน category นี้
    const productsToDelete = await Product.find({ category: id });
    console.log(`[${new Date().toISOString()}] Found ${productsToDelete.length} products to delete`);

    // ลบไฟล์รูปของ product ทั้งหมด
    for (const product of productsToDelete) {
      if (product.images && Array.isArray(product.images)) {
        for (const imageUrl of product.images) {
          try {
            const filename = imageUrl.split('/').pop();
            const imagePath = path.join(__dirname, '..', 'uploads', 'products', filename);
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
              console.log(`[${new Date().toISOString()}] Deleted product image file: ${imagePath}`);
            }
          } catch (fileError) {
            console.error(`[${new Date().toISOString()}] Error deleting product image file:`, fileError);
          }
        }
      }
    }

    // ลบ product ทั้งหมด
    const deleteResult = await Product.deleteMany({ category: id });
    console.log(`[${new Date().toISOString()}] Deleted ${deleteResult.deletedCount} products`);

    // Delete category image file if exists
    if (category.imageUrl) {
      const imagePath = path.join(__dirname, '..', category.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log(`[${new Date().toISOString()}] Deleted category image file: ${imagePath}`);
      }
    }

    // ลบ category
    await Category.findByIdAndDelete(id);
    
    console.log(`[${new Date().toISOString()}] Successfully deleted category with id: ${id} and ${deleteResult.deletedCount} related products`);
    res.json({ 
      message: `ลบรายการสำเร็จ พร้อมลบสินค้าที่เกี่ยวข้อง ${deleteResult.deletedCount} รายการ`,
      deletedProducts: deleteResult.deletedCount
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error deleting category:`, error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบรายการ' });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    console.log(`[${new Date().toISOString()}] PUT /api/categories/${id} - Updating category`);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    const category = await Category.findById(id);
    
    if (!category) {
      console.log(`[${new Date().toISOString()}] Category not found with id: ${id}`);
      return res.status(404).json({ message: 'ไม่พบรายการที่ต้องการแก้ไข' });
    }

    const updateData = {};
    
    if (name && name.trim()) {
      updateData.name = name.trim();
    }

    if (req.file) {
      // Delete old image if exists
      if (category.imageUrl) {
        const oldImagePath = path.join(__dirname, '..', category.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log(`[${new Date().toISOString()}] Deleted old image file: ${oldImagePath}`);
        }
      }
      
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true }
    );
    
    console.log(`[${new Date().toISOString()}] Successfully updated category:`, updatedCategory);
    res.json(updatedCategory);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error updating category:`, error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการแก้ไขรายการ' });
  }
};

// Get category by id
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'ไม่พบหมวดหมู่' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่' });
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  deleteCategory,
  updateCategory,
  getCategoryById
};
