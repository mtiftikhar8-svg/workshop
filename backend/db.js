const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/car_shop.db', (err) => {
  if (err) console.error("Database opening error: ", err);
  else console.log("Database connected successfully!");
});

// Create tables if not exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    quantity INTEGER,
    purchase_price REAL,
    sale_price REAL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    quantity INTEGER,
    sale_price REAL,
    date TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    name TEXT,
    amount REAL,
    received_by TEXT,
    date TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS withdraws (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    amount REAL,
    date TEXT
  )`);
});

module.exports = db;
