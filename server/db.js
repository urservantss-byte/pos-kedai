'use strict';
/**
 * db.js — Koneksi SQLite + skema + seed data (mock data).
 * Database dibuat otomatis di server/pos.db saat server pertama jalan.
 */
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'pos.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price INTEGER NOT NULL,
    emoji TEXT NOT NULL DEFAULT '🍽️',
    image TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    available INTEGER NOT NULL DEFAULT 1,
    has_spice_level INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    receipt_no TEXT NOT NULL UNIQUE,
    items TEXT NOT NULL,
    subtotal INTEGER NOT NULL,
    tax INTEGER NOT NULL,
    total INTEGER NOT NULL,
    payment_method TEXT NOT NULL,
    cash_paid INTEGER NOT NULL DEFAULT 0,
    change_amount INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
`);

// ---- Seed data (mock) — hanya kalau tabel produk masih kosong ----
const CATEGORIES = ['Bakso', 'Seblak', 'Minuman', 'Topping/Ekstra'];

const SEED_PRODUCTS = [
  // Bakso
  { name: 'Bakso Urat', category: 'Bakso', price: 15000, emoji: '🍜', description: 'Bakso sapi urat kenyal, kuah kaldu gurih.', has_spice_level: 0 },
  { name: 'Bakso Halus', category: 'Bakso', price: 12000, emoji: '🍜', description: 'Bakso halus lembut, cocok untuk anak-anak.', has_spice_level: 0 },
  { name: 'Bakso Spesial', category: 'Bakso', price: 18000, emoji: '🍜', description: 'Bakso urat + halus + telur, porsi jumbo.', has_spice_level: 0 },
  // Seblak — punya level pedas 1-5
  { name: 'Seblak Ceker', category: 'Seblak', price: 18000, emoji: '🌶️', description: 'Seblak kuah pedas dengan ceker empuk.', has_spice_level: 1 },
  { name: 'Seblak Sosis', category: 'Seblak', price: 17000, emoji: '🌶️', description: 'Seblak kuah pedas dengan sosis sapi.', has_spice_level: 1 },
  { name: 'Seblak Seafood', category: 'Seblak', price: 22000, emoji: '🦐', description: 'Seblak kuah pedas dengan udang & bakso ikan.', has_spice_level: 1 },
  // Minuman — Teh Poci
  { name: 'Teh Poci Original', category: 'Minuman', price: 8000, emoji: '🍵', description: 'Teh poci hangat/dingin, manis pas.', has_spice_level: 0 },
  { name: 'Teh Poci Lemon', category: 'Minuman', price: 10000, emoji: '🍋', description: 'Teh poci segar dengan perasan lemon.', has_spice_level: 0 },
  { name: 'Teh Poci Lychee', category: 'Minuman', price: 12000, emoji: '🍒', description: 'Teh poci dengan sirup leci, manis segar.', has_spice_level: 0 },
  // Topping / Ekstra
  { name: 'Kerupuk', category: 'Topping/Ekstra', price: 3000, emoji: '🍘', description: 'Kerupuk renyah pelengkap bakso/seblak.', has_spice_level: 0 },
  { name: 'Telur Rebus', category: 'Topping/Ekstra', price: 5000, emoji: '🥚', description: 'Telur rebus utuh.', has_spice_level: 0 },
  { name: 'Ceker Ekstra', category: 'Topping/Ekstra', price: 6000, emoji: '🍗', description: 'Tambahan ceker empuk 3 pcs.', has_spice_level: 0 },
  { name: 'Mie Ekstra', category: 'Topping/Ekstra', price: 4000, emoji: '🍝', description: 'Tambahan mie kuning 1 porsi.', has_spice_level: 0 },
];

const count = db.prepare('SELECT COUNT(*) AS n FROM products').get().n;
if (count === 0) {
  const insert = db.prepare(
    'INSERT INTO products (name, category, price, emoji, description, has_spice_level) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const seed = db.transaction((rows) => {
    for (const p of rows) insert.run(p.name, p.category, p.price, p.emoji, p.description, p.has_spice_level);
  });
  seed(SEED_PRODUCTS);
  console.log(`[db] Seed ${SEED_PRODUCTS.length} produk mock data.`);
}

module.exports = { db, CATEGORIES };
