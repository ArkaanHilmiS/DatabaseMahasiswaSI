const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware');
const db = require('../db');

const VALID_ROLES = ['owner', 'admin', 'viewer'];

// GET /api/users — hanya owner
router.get('/', requireAuth, requireRole('owner'), (req, res) => {
  const users = db.prepare('SELECT id, email, name, picture, role, created_at, last_login FROM users').all();
  res.json({ success: true, data: users });
});

// PUT /api/users/:id/role — hanya owner, dan tidak bisa ubah role diri sendiri
router.put('/:id/role', requireAuth, requireRole('owner'), (req, res) => {
  const targetId = parseInt(req.params.id);
  const { role } = req.body;

  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: `Role tidak valid. Pilihan: ${VALID_ROLES.join(', ')}` });
  }

  const targetUser = db.prepare('SELECT * FROM users WHERE id = ?').get(targetId);
  if (!targetUser) {
    return res.status(404).json({ error: 'User tidak ditemukan' });
  }

  // Owner tidak bisa menurunkan role dirinya sendiri
  if (targetUser.email === req.user.email) {
    return res.status(400).json({ error: 'Tidak bisa mengubah role diri sendiri' });
  }

  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, targetId);
  res.json({ success: true, message: `Role ${targetUser.email} diubah menjadi ${role}` });
});

// GET /api/users/me — info user yang sedang login
router.get('/me', requireAuth, (req, res) => {
  res.json({ success: true, user: {
    email: req.user.email,
    name: req.user.name,
    picture: req.user.picture,
    role: req.user.role,
  }});
});

module.exports = router;