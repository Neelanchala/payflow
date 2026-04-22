const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath);

// Enable WAL
db.pragma('journal_mode = WAL');

// ================= SCHEMA =================
db.exec(`
CREATE TABLE IF NOT EXISTS merchants (
  id TEXT PRIMARY KEY,
  shop_name TEXT NOT NULL,
  upi_id TEXT
);

CREATE TABLE IF NOT EXISTS inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  merchant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  merchant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  merchant_id TEXT NOT NULL,
  amount REAL NOT NULL,
  reference TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PAID',
  customer_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  merchant_id TEXT NOT NULL,
  title TEXT NOT NULL,
  amount REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  merchant_id TEXT NOT NULL,
  message TEXT NOT NULL,
  read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

// ================= SAFE WRAPPERS (COMPATIBLE WITH YOUR OLD CODE) =================

// getAsync → single row
db.getAsync = async (sql, params = []) => {
  try {
    return db.prepare(sql).get(params);
  } catch (err) {
    throw err;
  }
};

// allAsync → multiple rows
db.allAsync = async (sql, params = []) => {
  try {
    return db.prepare(sql).all(params);
  } catch (err) {
    throw err;
  }
};

// runAsync → insert/update/delete
db.runAsync = async (sql, params = []) => {
  try {
    const result = db.prepare(sql).run(params);
    return {
      lastID: result.lastInsertRowid,
      changes: result.changes
    };
  } catch (err) {
    throw err;
  }
};

module.exports = db;