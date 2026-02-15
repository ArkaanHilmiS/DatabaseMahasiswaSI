const jwt = require('jsonwebtoken');
const db = require('./db');

// Middleware: cek apakah request punya JWT valid
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token tidak ada atau tidak valid' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Ambil data user terbaru dari DB (termasuk role)
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(decoded.email);
    if (!user) return res.status(401).json({ error: 'User tidak ditemukan' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token expired atau tidak valid' });
  }
}

// Middleware: cek role minimum
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Belum login' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Akses ditolak. Butuh role: ${roles.join(' atau ')}`
      });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };