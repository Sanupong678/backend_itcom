const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret'; // ต้องตรงกับ middleware

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'Tum0979359145'; // เปลี่ยนรหัสผ่านที่ต้องการ

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = jwt.sign(
      { username: ADMIN_USERNAME, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    return res.json({ token }); // ส่ง field token
  } else {
    return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
  }
});

module.exports = router; 