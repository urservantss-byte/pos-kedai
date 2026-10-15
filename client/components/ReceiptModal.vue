<template>
  <div v-if="show && order" class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" @click.self="$emit('close')">
    <div class="max-h-[92vh] w-full max-w-sm overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl dark:bg-slate-900 sm:rounded-2xl">
      <div class="no-print mb-3 flex items-center justify-between">
        <h3 class="text-lg font-bold">✅ Pembayaran Berhasil</h3>
        <button class="rounded-full bg-slate-100 px-3 py-1 text-sm dark:bg-slate-800" @click="$emit('close')">✕</button>
      </div>

      <!-- Struk thermal (area yang dicetak) -->
      <div id="receipt-print" class="bg-white font-mono text-[13px] leading-snug text-black">
        <div class="border-b border-dashed border-black pb-2 text-center">
          <p class="text-base font-bold">KEDAI BAKSO & SEBLAK</p>
          <p>Teh Poci Segar · Jl. Kuliner No. 1</p>
          <p>Telp 0812-3456-7890</p>
        </div>
        <div class="flex justify-between py-2">
          <span>No: {{ order.receipt_no }}</span>
          <span>{{ formatDate(order.created_at) }}</span>
        </div>
        <div class="border-t border-dashed border-black py-2">
          <div v-for="item in order.items" :key="item.product_id + item.note + item.spice_level" class="mb-1.5">
            <div class="flex justify-between">
              <span>{{ item.name }} × {{ item.qty }}</span>
              <span>{{ formatRupiah(item.price * item.qty) }}</span>
            </div>
            <p v-if="item.spice_level" class="text-[11px]">- Level pedas {{ item.spice_level }}</p>
            <p v-if="item.note" class="text-[11px]">- {{ item.note }}</p>
          </div>
        </div>
        <div class="border-t border-dashed border-black py-2">
          <div class="flex justify-between"><span>Subtotal</span><span>{{ formatRupiah(order.subtotal) }}</span></div>
          <div class="flex justify-between"><span>Pajak (10%)</span><span>{{ formatRupiah(order.tax) }}</span></div>
          <div class="flex justify-between font-bold"><span>TOTAL</span><span>{{ formatRupiah(order.total) }}</span></div>
          <div class="flex justify-between"><span>Bayar ({{ order.payment_method }})</span><span>{{ formatRupiah(order.cash_paid || order.total) }}</span></div>
          <div v-if="order.payment_method === 'Tunai'" class="flex justify-between"><span>Kembalian</span><span>{{ formatRupiah(order.change_amount) }}</span></div>
        </div>
        <p class="border-t border-dashed border-black pt-2 text-center">Terima kasih sudah mampir! 🙏</p>
      </div>

      <div class="no-print mt-4 flex gap-2">
        <button class="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-semibold dark:border-slate-600" @click="printReceipt">
          🖨️ Cetak Struk
        </button>
        <button class="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700" @click="$emit('new-transaction')">
          Transaksi Baru
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatRupiah } from '~/utils/format';

defineProps({
  show: { type: Boolean, default: false },
  order: { type: Object, default: null },
});
defineEmits(['close', 'new-transaction']);

function formatDate(s) {
  if (!s) return '';
  return new Date(s.replace(' ', 'T')).toLocaleString('id-ID', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function printReceipt() {
  window.print();
}
</script>
