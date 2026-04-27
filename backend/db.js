const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

// ================= INIT =================
db.serialize(() => {

  db.run('PRAGMA journal_mode = WAL');

  // ================= MERCHANTS =================
  db.run(`CREATE TABLE IF NOT EXISTS merchants (
    id TEXT PRIMARY KEY,
    shop_name TEXT NOT NULL,
    password TEXT,
    upi_id TEXT
  )`);

  // SAFE MIGRATION (password)
  db.run(`ALTER TABLE merchants ADD COLUMN password TEXT`, (err) => {
    if (err && !err.message.includes("duplicate column")) {
      console.error("❌ password alter error:", err.message);
    }
  });

  // ================= CUSTOMERS =================
  db.run(`CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    merchant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT
  )`);

  // 🔥 NOW ALTER (correct position)
  db.run(`ALTER TABLE customers ADD COLUMN total_due REAL DEFAULT 0`, (err) => {
    if (err && !err.message.includes("duplicate column")) {
      console.error("❌ total_due error:", err.message);
    } else {
      console.log("ℹ️ total_due ready");
    }
  });

  // ================= OTHER TABLES =================
  db.run(`CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    merchant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    merchant_id TEXT NOT NULL,
    amount REAL NOT NULL,
    reference TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PAID',
    customer_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    merchant_id TEXT NOT NULL,
    title TEXT NOT NULL,
    amount REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    merchant_id TEXT NOT NULL,
    message TEXT NOT NULL,
    read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

});

// Promises (same API you already use)
db.getAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

db.allAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

db.runAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

module.exports = db;