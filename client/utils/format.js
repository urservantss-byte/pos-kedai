// Helper format mata uang Rupiah: 15000 -> "Rp 15.000"
export function formatRupiah(n) {
  return 'Rp ' + Number(n || 0).toLocaleString('id-ID');
}
