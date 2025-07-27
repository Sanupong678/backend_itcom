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
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

app.use('/api/banner', bannerRoutes);
app.use('/api', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminProfileRoutes);
app.use('/api/whycontent', whyContentRoutes);
app.use('/api/footer', footerRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Backend API only - frontend will be deployed separately

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});
