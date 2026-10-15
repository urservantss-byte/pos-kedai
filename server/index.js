'use strict';
/**
 * index.js — API server Express untuk POS Kedai.
 * Semua perhitungan uang (subtotal, pajak, total) dilakukan di server
 * supaya total tidak bisa dimanipulasi dari frontend.
 */
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { db, CATEGORIES } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;
const TAX_RATE = 0.10; // Pajak 10%

app.use(cors());
app.use(express.json());

const toProduct = (row) => ({
  ...row,
  available: row.available === 1,
  has_spice_level: row.has_spice_level === 1,
});

// ---------- Health ----------
app.get('/api/health', (req, res) => res.json({ ok: true }));

// ---------- Produk ----------
app.get('/api/products', (req, res) => {
  const { category, search } = req.query;
  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];
  if (category && category !== 'Semua') {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (search) {
    sql += ' AND name LIKE ?';
    params.push(`%${search}%`);
  }
  sql += ' ORDER BY category, name';
  res.json(db.prepare(sql).all(...params).map(toProduct));
});

app.get('/api/products/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Produk tidak ditemukan' });
  res.json(toProduct(row));
});

function validateProduct(body) {
  const { name, category, price, stock } = body;
  if (!name || typeof name !== 'string') return 'Nama produk wajib diisi';
  if (!CATEGORIES.includes(category)) return `Kategori harus salah satu: ${CATEGORIES.join(', ')}`;
  if (!Number.isInteger(price) || price < 0) return 'Harga harus bilangan bulat >= 0';
  if (stock !== undefined && (!Number.isInteger(stock) || stock < 0)) return 'Stok harus bilangan bulat >= 0';
  return null;
}

app.post('/api/products', (req, res) => {
  const err = validateProduct(req.body);
  if (err) return res.status(400).json({ error: err });
  const { name, category, price, emoji = '🍽️', image = '', description = '', available = 1, has_spice_level = 0, stock = 20 } = req.body;
  const info = db.prepare(
    'INSERT INTO products (name, category, price, emoji, image, description, available, has_spice_level, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(name, category, price, emoji, image, description, available ? 1 : 0, has_spice_level ? 1 : 0, stock);
  res.status(201).json(toProduct(db.prepare('SELECT * FROM products WHERE id = ?').get(info.lastInsertRowid)));
});

app.put('/api/products/:id', (req, res) => {
  const err = validateProduct(req.body);
  if (err) return res.status(400).json({ error: err });
  const { name, category, price, emoji = '🍽️', image = '', description = '', available = 1, has_spice_level = 0, stock = 20 } = req.body;
  const info = db.prepare(
    'UPDATE products SET name=?, category=?, price=?, emoji=?, image=?, description=?, available=?, has_spice_level=?, stock=? WHERE id=?'
  ).run(name, category, price, emoji, image, description, available ? 1 : 0, has_spice_level ? 1 : 0, stock, req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Produk tidak ditemukan' });
  res.json(toProduct(db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id)));
});

app.patch('/api/products/:id/availability', (req, res) => {
  const available = req.body.available ? 1 : 0;
  const info = db.prepare('UPDATE products SET available=? WHERE id=?').run(available, req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Produk tidak ditemukan' });
  res.json(toProduct(db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id)));
});

app.delete('/api/products/:id', (req, res) => {
  const info = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Produk tidak ditemukan' });
  res.json({ ok: true });
});

// ---------- Pesanan ----------
const PAYMENT_METHODS = ['Tunai', 'QRIS', 'Transfer'];

app.post('/api/orders', (req, res) => {
  const { items, payment_method, cash_paid = 0 } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Keranjang kosong' });
  }
  if (!PAYMENT_METHODS.includes(payment_method)) {
    return res.status(400).json({ error: `Metode pembayaran harus salah satu: ${PAYMENT_METHODS.join(', ')}` });
  }

  // Hitung ulang dari harga di DB (harga dari client tidak dipercaya).
  let subtotal = 0;
  const finalItems = [];
  for (const item of items) {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.product_id);
    if (!product) return res.status(400).json({ error: `Produk id ${item.product_id} tidak ditemukan` });
    if (product.available !== 1) return res.status(400).json({ error: `${product.name} sedang habis` });
    const qty = Math.max(1, parseInt(item.qty, 10) || 1);
    if (product.stock < qty) return res.status(400).json({ error: `Stok ${product.name} tersisa ${product.stock} porsi` });
    const line = {
      product_id: product.id,
      name: product.name,
      price: product.price,
      qty,
      note: String(item.note || '').slice(0, 200),
      spice_level: product.has_spice_level ? Math.min(5, Math.max(1, parseInt(item.spice_level, 10) || 1)) : null,
    };
    subtotal += line.price * line.qty;
    finalItems.push(line);
  }

  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;
  const cash = payment_method === 'Tunai' ? Math.max(0, parseInt(cash_paid, 10) || 0) : 0;
  if (payment_method === 'Tunai' && cash < total) {
    return res.status(400).json({ error: 'Uang tunai kurang dari total' });
  }
  const change = payment_method === 'Tunai' ? cash - total : 0;

  // Nomor struk: STR-YYYYMMDD-XXXX (urutan per hari)
  const today = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  const countToday = db.prepare("SELECT COUNT(*) AS n FROM orders WHERE created_at LIKE date('now','localtime') || '%'").get().n;
  const receiptNo = `STR-${today}-${String(countToday + 1).padStart(4, '0')}`;

  const info = db.transaction(() => {
    // Kurangi stok per item; stok habis -> otomatis tandai Habis.
    for (const line of finalItems) {
      db.prepare(
        'UPDATE products SET stock = stock - ?, available = CASE WHEN stock - ? <= 0 THEN 0 ELSE available END WHERE id = ?'
      ).run(line.qty, line.qty, line.product_id);
    }
    return db.prepare(
      'INSERT INTO orders (receipt_no, items, subtotal, tax, total, payment_method, cash_paid, change_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(receiptNo, JSON.stringify(finalItems), subtotal, tax, total, payment_method, cash, change);
  })();

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ ...order, items: JSON.parse(order.items) });
});

app.get('/api/orders', (req, res) => {
  const limit = Math.min(200, parseInt(req.query.limit, 10) || 100);
  const rows = db.prepare('SELECT * FROM orders ORDER BY id DESC LIMIT ?').all(limit);
  res.json(rows.map((r) => ({ ...r, items: JSON.parse(r.items) })));
});

// ---------- Dashboard ----------
app.get('/api/dashboard', (req, res) => {
  const today = db.prepare(
    "SELECT COUNT(*) AS orders, COALESCE(SUM(total),0) AS revenue FROM orders WHERE created_at LIKE date('now','localtime') || '%'"
  ).get();

  // Minggu ini: Senin 00:00 s.d. Senin depan 00:00 (waktu lokal server).
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const nextMonday = new Date(monday);
  nextMonday.setDate(monday.getDate() + 7);
  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  const week = db.prepare(
    'SELECT COUNT(*) AS orders, COALESCE(SUM(total),0) AS revenue FROM orders WHERE created_at >= ? AND created_at < ?'
  ).get(fmt(monday), fmt(nextMonday));

  // Pendapatan 7 hari terakhir (untuk grafik batang sederhana).
  const dailyRevenue = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const row = db.prepare(
      "SELECT COUNT(*) AS orders, COALESCE(SUM(total),0) AS revenue FROM orders WHERE created_at LIKE ? || '%'"
    ).get(dayStr);
    dailyRevenue.push({
      date: dayStr,
      label: d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
      orders: row.orders,
      revenue: row.revenue,
    });
  }

  // Stok menipis: sisa < 5 porsi, urut paling kritis dulu.
  const lowStock = db.prepare(
    'SELECT * FROM products WHERE stock < 5 ORDER BY stock ASC, name ASC'
  ).all().map(toProduct);

  // Best seller hari ini: agregasi qty per nama menu.
  const todayOrders = db.prepare(
    "SELECT items FROM orders WHERE created_at LIKE date('now','localtime') || '%'"
  ).all();
  const sold = new Map();
  for (const o of todayOrders) {
    for (const item of JSON.parse(o.items)) {
      sold.set(item.name, (sold.get(item.name) || 0) + item.qty);
    }
  }
  const bestSeller = [...sold.entries()]
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const recent = db.prepare('SELECT * FROM orders ORDER BY id DESC LIMIT 10').all()
    .map((r) => ({ ...r, items: JSON.parse(r.items) }));

  res.json({
    todayRevenue: today.revenue,
    todayOrders: today.orders,
    weekRevenue: week.revenue,
    weekOrders: week.orders,
    dailyRevenue,
    lowStock,
    bestSeller,
    recentOrders: recent,
  });
});

// ---------- Frontend statis (deploy satu service) ----------
// Di Railway, hasil build Nuxt (client/.output/public) disajikan oleh
// server ini juga, jadi cukup 1 service. Kalau folder build belum ada
// (mis. dev lokal, frontend jalan di :3000), blok ini dilewati.
const clientDir = path.join(__dirname, '..', 'client', '.output', 'public');
if (fs.existsSync(clientDir)) {
  app.use(express.static(clientDir));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDir, 'index.html'), (err) => { if (err) next(); });
  });
}

app.listen(PORT, () => {
  console.log(`[pos-server] API jalan di http://localhost:${PORT}`);
});
