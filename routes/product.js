const express = require('express');
const router = express.Router();
const { 
  getAllProducts,
  getProductsByCategory, 
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  upload
} = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

// GET all products
router.get('/', getAllProducts);

// GET products by category
router.get('/by-category', getProductsByCategory);

// GET single product by ID
router.get('/:id', getProductById);

// POST create new product (with multiple image uploads)
router.post('/', authMiddleware, upload.array('images', 10), createProduct);

// PUT update product (with multiple image uploads)
router.put('/:id', authMiddleware, upload.array('images', 10), updateProduct);

// DELETE product
router.delete('/:id', authMiddleware, deleteProduct);

// PATCH update product status
router.patch('/:id/status', authMiddleware, updateProductStatus);

module.exports = router; 