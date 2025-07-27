const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  let token = null;
  // ลองอ่านจาก cookie ก่อน
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else {
    // ถ้าไม่มีใน cookie ให้ fallback ไปอ่านจาก header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}; 