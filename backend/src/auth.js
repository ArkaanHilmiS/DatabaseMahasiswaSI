const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const db = require('./db');

const oauthClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Generate URL untuk redirect ke halaman login Google
function getAuthUrl() {
  return oauthClient.generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
    prompt: 'select_account',
  });
}

// Tukar code dari Google dengan data user
async function handleCallback(code) {
  const { tokens } = await oauthClient.getToken(code);
  oauthClient.setCredentials(tokens);

  // Verifikasi id_token untuk dapat info user
  const ticket = await oauthClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  const email = payload.email;
  const name = payload.name;
  const picture = payload.picture;

  // Cek atau buat user di database
  let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (!user) {
    // User pertama kali login → role default: viewer
    // KECUALI kalau tidak ada user sama sekali → jadi owner
    const userCount = db.prepare('SELECT COUNT(*) as cnt FROM users').get();
    const role = userCount.cnt === 0 ? 'owner' : 'viewer';

    db.prepare(`
      INSERT INTO users (email, name, picture, role)
      VALUES (?, ?, ?, ?)
    `).run(email, name, picture, role);

    user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  } else {
    // Update info terakhir login
    db.prepare(`
      UPDATE users SET name = ?, picture = ?, last_login = datetime('now')
      WHERE email = ?
    `).run(name, picture, email);
    user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  }

  // Buat JWT untuk frontend
  const jwtToken = jwt.sign(
    { email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { token: jwtToken, user };
}

module.exports = { getAuthUrl, handleCallback };