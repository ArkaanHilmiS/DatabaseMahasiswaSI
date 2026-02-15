if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { getAuthUrl, handleCallback } = require('./auth');

const app = express();

// Keamanan
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5500',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/mahasiswa', require('./routes/mahasiswa'));
app.use('/api/users', require('./routes/users'));

// Auth routes
app.get('/api/auth/google', (req, res) => {
  const url = getAuthUrl();
  res.redirect(url);
});

app.get('/api/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect(`${process.env.FRONTEND_URL}?error=no_code`);

  try {
    const { token, user } = await handleCallback(code);
    // Redirect ke frontend dengan token di URL (akan disimpan di localStorage)
    res.redirect(`${process.env.FRONTEND_URL}/dashboard.html?token=${token}&role=${user.role}`);
  } catch (err) {
    console.error(err);
    res.redirect(`${process.env.FRONTEND_URL}?error=auth_failed`);
  }
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));