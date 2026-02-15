const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../data.db'));

// Buat tabel jika belum ada
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    picture TEXT,
    role TEXT NOT NULL DEFAULT 'viewer',
    -- role: 'owner' | 'admin' | 'viewer'
    created_at TEXT DEFAULT (datetime('now')),
    last_login TEXT
  )
`);

module.exports = db;