/**
 * useExportExcel — bangun & unduh laporan penjualan .xlsx via SheetJS (xlsx).
 * Format rapi & formal: judul + periode + ringkasan, lalu tabel transaksi
 * dengan lebar kolom diatur, diakhiri baris total. Sheet kedua: Stok Menipis.
 * Dipakai halaman Dashboard; bisa dipanggil dari mana saja (pure function).
 */
import * as XLSX from 'xlsx';

const fmtDate = (d) => d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
const fmtDateTime = (s) => {
  const d = new Date(String(s).replace(' ', 'T'));
  return Number.isNaN(d.getTime()) ? String(s) : d.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};
const itemsText = (items) => (items || []).map((i) => `${i.name} ×${i.qty}`).join(', ');

export function buildLaporanWorkbook({ summary, transactions, lowStock, periodLabel }) {
  const wb = XLSX.utils.book_new();

  // ---------- Sheet 1: Laporan Penjualan ----------
  const rows = [
    ['LAPORAN PENJUALAN — POS KEDAI'],
    ['Bakso, Seblak & Teh Poci'],
    [`Periode: ${periodLabel}`],
    [],
    ['RINGKASAN'],
    ['Pendapatan Hari Ini (Rp)', summary.todayRevenue],
    ['Jumlah Transaksi Hari Ini', summary.todayOrders],
    ['Pendapatan Minggu Ini (Rp)', summary.weekRevenue],
    ['Jumlah Transaksi Minggu Ini', summary.weekOrders],
    [],
    ['DAFTAR TRANSAKSI TERAKHIR'],
    ['Waktu', 'Nomor Struk', 'Item yang Dibeli', 'Metode Pembayaran', 'Total Pembayaran (Rp)'],
  ];
  for (const t of transactions) {
    rows.push([fmtDateTime(t.created_at), t.receipt_no, itemsText(t.items), t.payment_method, t.total]);
  }
  const totalAll = transactions.reduce((s, t) => s + (t.total || 0), 0);
  rows.push(['', '', '', 'TOTAL', totalAll]);
  rows.push([]);
  rows.push([`Diekspor pada ${fmtDateTime(new Date().toISOString().replace('T', ' ').slice(0, 19))} — POS Kedai`]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 28 }, { wch: 20 }, { wch: 52 }, { wch: 20 }, { wch: 24 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Laporan Penjualan');

  // ---------- Sheet 2: Stok Menipis ----------
  const stockRows = [
    ['STOK MENIPIS — POS KEDAI'],
    [`Periode: ${periodLabel}`],
    [],
    ['Menu', 'Kategori', 'Sisa Stok (Porsi)', 'Status'],
  ];
  for (const p of lowStock) {
    stockRows.push([p.name, p.category, p.stock, p.stock === 0 ? 'HABIS' : 'MENIPIS']);
  }
  if (!lowStock.length) stockRows.push(['—', '—', '—', 'Semua stok aman (>= 5 porsi)']);
  const ws2 = XLSX.utils.aoa_to_sheet(stockRows);
  ws2['!cols'] = [{ wch: 28 }, { wch: 18 }, { wch: 20 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Stok Menipis');

  return wb;
}

export function downloadLaporanExcel({ summary, transactions, lowStock, periodLabel }) {
  const wb = buildLaporanWorkbook({ summary, transactions, lowStock, periodLabel });
  const stamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `laporan-pos-kedai-${stamp}.xlsx`);
}

export function useExportExcel() {
  return { buildLaporanWorkbook, downloadLaporanExcel };
}
