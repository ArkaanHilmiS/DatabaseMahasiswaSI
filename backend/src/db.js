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
  );

  CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_id TEXT NOT NULL,
    -- unique ID per visitor (generated di frontend)
    ip_address TEXT,
    user_agent TEXT,
    visited_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_visitor_id ON visits(visitor_id);
  CREATE INDEX IF NOT EXISTS idx_visited_at ON visits(visited_at);
`);

module.exports = db;