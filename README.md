# Category Shop Backend

Backend API สำหรับ Category Shop application

## Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์ backend:

```env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/categoryshopcard
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-app.railway.app
```

## Scripts

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/categories` - Get all categories
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `PATCH /api/products/:id/status` - Update product status
- `GET /api/admin/profile` - Get admin profile
- `PUT /api/admin/profile` - Update admin profile
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout

## Railway Deployment

1. สร้าง Railway project
2. เชื่อมต่อกับ GitHub repository
3. ตั้งค่า environment variables
4. Deploy อัตโนมัติ 