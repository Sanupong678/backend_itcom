require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors =require('cors');
const path = require('path');
const fs = require('fs');
const bannerRoutes = require('./routes/banner');
const categoryRoutes = require('./routes/category');
const productRoutes = require('./routes/product');
const adminProfileRoutes = require('./routes/adminProfile');
const whyContentRoutes = require('./routes/whyContent');
const footerRoutes = require('./routes/footer');
const authRoutes = require('./routes/auth');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'http://localhost:5173', // Development
        process.env.FRONTEND_URL || 'https://your-frontend-app.railway.app', // Production Frontend
        'https://your-frontend-app.up.railway.app'
      ]
    : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Middleware to check if image file exists before serving
app.use('/uploads', (req, res, next) => {
  const filePath = path.join(__dirname, 'uploads', req.url);
  if (fs.existsSync(filePath)) {
    next();
  } else {
    console.log(`[${new Date().toISOString()}] Missing file requested: ${req.url}`);
    res.status(404).json({ error: 'Image file not found' });
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🔽 เชื่อม MONGO_URL ให้ตรงกับ .env
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URL) {
      console.error('❌ MONGO_URL is not defined');
      return;
    }
    
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    // Don't exit the process, let it continue
  }
};

connectDB();

app.use('/api/banner', bannerRoutes);
app.use('/api', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminProfileRoutes);
app.use('/api/whycontent', whyContentRoutes);
app.use('/api/footer', footerRoutes);
app.use('/api/auth', authRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Category Shop Backend API',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  try {
    // Check if MongoDB is connected
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: dbStatus,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Backend API only - frontend will be deployed separately

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});
