const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Database Path
const db = new sqlite3.Database(
  path.join(__dirname, "furniture.db"),
  (err) => {
    if (err) {
      console.error("Database Connection Error:", err.message);
    } else {
      console.log("Database Connected Successfully");
    }
  }
);

// Create Tables
db.serialize(() => {

  // =========================
  // ADMINS TABLE
  // =========================
  db.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // =========================
  // CATEGORIES TABLE
  // =========================
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // =========================
  // PRODUCTS TABLE
  // =========================
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      sku TEXT,
      category_id INTEGER,
      brand TEXT,
      price REAL,
      sale_price REAL,
      short_description TEXT,
      status TEXT DEFAULT 'draft',
      featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY(category_id)
      REFERENCES categories(id)
    )
  `);

  // =========================
  // PRODUCT SECTIONS
  // Dynamic page builder
  // =========================
  db.run(`
    CREATE TABLE IF NOT EXISTS product_sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,

      section_type TEXT NOT NULL,

      title TEXT,
      subtitle TEXT,

      content TEXT,

      button_text TEXT,
      button_link TEXT,

      image TEXT,

      sort_order INTEGER DEFAULT 0,

      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY(product_id)
      REFERENCES products(id)
    )
  `);

  // =========================
  // PRODUCT GALLERY
  // =========================
  db.run(`
    CREATE TABLE IF NOT EXISTS product_gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      image TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,

      FOREIGN KEY(product_id)
      REFERENCES products(id)
    )
  `);

  // =========================
  // PRODUCT FAQS
  // =========================
  db.run(`
    CREATE TABLE IF NOT EXISTS product_faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,

      FOREIGN KEY(product_id)
      REFERENCES products(id)
    )
  `);

  // =========================
  // PRODUCT SPECIFICATIONS
  // =========================
  db.run(`
    CREATE TABLE IF NOT EXISTS product_specifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      spec_name TEXT NOT NULL,
      spec_value TEXT NOT NULL,

      FOREIGN KEY(product_id)
      REFERENCES products(id)
    )
  `);

  // =========================
  // ENQUIRIES TABLE
  // =========================
  db.run(`
    CREATE TABLE IF NOT EXISTS enquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      product_id INTEGER,
      message TEXT,
      status TEXT DEFAULT 'new',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      contacted_at DATETIME,

      FOREIGN KEY(product_id)
      REFERENCES products(id)
    )
  `);

  console.log("All Tables Created Successfully");
});

// Close DB
db.close(() => {
  console.log("Database Closed");
});