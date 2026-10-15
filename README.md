# POS Kedai — Bakso, Seblak & Teh Poci

Aplikasi kasir (Point of Sales) berbasis web untuk kedai makanan.

## Stack

- **Frontend:** Nuxt 3 (Vue 3) + Tailwind CSS
- **Backend:** Express.js + SQLite (`better-sqlite3`)
- **Database:** file `server/pos.db` (dibuat otomatis + seed data)

## Cara jalanin

```bash
# 1. Install semua dependensi
npm run install:all

# 2. Jalankan backend (port 3001) — terminal 1
npm run dev:server

# 3. Jalankan frontend (port 3000) — terminal 2
npm run dev:client
```

Buka **http://localhost:3000** → halaman Kasir.

## Fitur

| Halaman | Isi |
|---|---|
| Kasir (`/`) | Grid menu, filter kategori, kustomisasi (level pedas + catatan), keranjang, pembayaran (Tunai / QRIS / Transfer), struk |
| Dashboard (`/dashboard`) | Pendapatan hari ini, jumlah pesanan, menu terlaris, pesanan terbaru |
| Produk (`/produk`) | CRUD menu + toggle Habis/Sold Out |
| Riwayat (`/riwayat`) | Daftar transaksi + detail struk |

## API backend (port 3001)

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/products` | List produk (`?category=`, `?search=`) |
| POST | `/api/products` | Tambah produk |
| PUT | `/api/products/:id` | Ubah produk |
| PATCH | `/api/products/:id/availability` | Toggle Habis `{available: 0/1}` |
| DELETE | `/api/products/:id` | Hapus produk |
| POST | `/api/orders` | Buat pesanan (hitung subtotal + pajak 10% di server) |
| GET | `/api/orders` | Riwayat transaksi |
| GET | `/api/dashboard` | Ringkasan hari ini + best seller |

## Catatan

- **Pajak:** 10% dari subtotal, dihitung di server (bukan di frontend) supaya total tidak bisa dimanipulasi.
- **Foto produk:** tiap produk punya field `image` (URL). Kalau kosong, tampil tile emoji + gradasi warna per kategori. Isi URL foto di halaman Produk untuk pakai foto asli.
- **Struk:** tombol "Cetak Struk" memakai `window.print()` dengan CSS khusus thermal (58mm). Untuk PDF, pilih "Save as PDF" di dialog print browser.
- **Dark mode:** tombol bulan/matahari di sidebar, tersimpan di `localStorage`.
