<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" @click.self="$emit('close')">
    <div class="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl dark:bg-slate-900 sm:rounded-2xl">
      <div class="mb-4 flex items-start justify-between">
        <div>
          <h3 class="text-lg font-bold">Pembayaran</h3>
          <p class="text-sm text-slate-500">Total: <span class="font-bold text-brand-600">{{ formatRupiah(total) }}</span></p>
        </div>
        <button class="rounded-full bg-slate-100 px-3 py-1 text-sm dark:bg-slate-800" @click="$emit('close')">✕</button>
      </div>

      <!-- Pilihan metode -->
      <div class="mb-4 grid grid-cols-3 gap-2">
        <button
          v-for="m in methods"
          :key="m.key"
          class="rounded-xl border px-2 py-3 text-center transition"
          :class="method === m.key
            ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/30'
            : 'border-slate-200 dark:border-slate-700'"
          @click="method = m.key"
        >
          <span class="block text-2xl">{{ m.icon }}</span>
          <span class="text-xs font-semibold">{{ m.label }}</span>
        </button>
      </div>

      <!-- Tunai -->
      <div v-if="method === 'Tunai'">
        <p class="mb-2 text-sm font-semibold">Uang Diterima</p>
        <div class="mb-2 flex flex-wrap gap-1.5">
          <button
            v-for="v in [total, 20000, 50000, 100000]"
            :key="v"
            class="rounded-full border border-slate-200 px-3 py-1.5 text-xs hover:border-brand-400 dark:border-slate-700"
            @click="cashPaid = v"
          >
            {{ formatRupiah(v) }}
          </button>
        </div>
        <input
          v-model.number="cashPaid"
          type="number"
          min="0"
          placeholder="Masukkan nominal uang"
          class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
        />
        <div class="mt-3 flex justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800">
          <span>Kembalian</span>
          <span class="font-bold" :class="change >= 0 ? 'text-tea-600' : 'text-red-500'">{{ formatRupiah(Math.max(0, change)) }}</span>
        </div>
        <p v-if="change < 0" class="mt-1 text-xs text-red-500">Uang kurang {{ formatRupiah(-change) }}</p>
      </div>

      <!-- QRIS -->
      <div v-if="method === 'QRIS'" class="text-center">
        <div class="mx-auto flex h-44 w-44 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-800">
          <span class="text-4xl">📷</span>
          <p class="mt-1 text-sm font-bold">QRIS</p>
          <p class="px-4 text-[11px] text-slate-500">Tempel gambar QRIS statis kedai di sini (file di halaman Produk / ganti blok ini dengan &lt;img&gt;)</p>
        </div>
        <p class="mt-2 text-sm">Pelanggan scan QR di atas sebesar <b>{{ formatRupiah(total) }}</b>, lalu kasir konfirmasi.</p>
      </div>

      <!-- Transfer -->
      <div v-if="method === 'Transfer'">
        <p class="mb-2 text-sm font-semibold">Pilih Bank / E-Wallet</p>
        <div class="space-y-2">
          <label
            v-for="b in banks"
            :key="b.name"
            class="flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2.5 text-sm"
            :class="bank === b.name ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/30' : 'border-slate-200 dark:border-slate-700'"
          >
            <span><input v-model="bank" type="radio" :value="b.name" class="mr-2" />{{ b.name }}</span>
            <span class="font-mono text-xs">{{ b.account }}</span>
          </label>
        </div>
        <p class="mt-2 text-xs text-slate-500">Minta pelanggan transfer sebesar {{ formatRupiah(total) }}, lalu konfirmasi.</p>
      </div>

      <button
        :disabled="!canConfirm"
        class="mt-5 w-full rounded-xl bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
        @click="confirm"
      >
        Konfirmasi Pembayaran
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { formatRupiah } from '~/utils/format';

const props = defineProps({
  show: { type: Boolean, default: false },
  total: { type: Number, required: true },
});
const emit = defineEmits(['close', 'confirm']);

const methods = [
  { key: 'Tunai', label: 'Tunai', icon: '💵' },
  { key: 'QRIS', label: 'QRIS', icon: '📷' },
  { key: 'Transfer', label: 'Transfer', icon: '🏦' },
];
const banks = [
  { name: 'BCA', account: '123 456 7890' },
  { name: 'BRI', account: '0987 6543 21' },
  { name: 'Mandiri', account: '1357 2468 90' },
  { name: 'DANA', account: '0812-3456-7890' },
];

const method = ref('Tunai');
const cashPaid = ref(0);
const bank = ref('BCA');

const change = computed(() => cashPaid.value - props.total);
const canConfirm = computed(() => method.value !== 'Tunai' || change.value >= 0);

function confirm() {
  emit('confirm', {
    method: method.value,
    cash_paid: method.value === 'Tunai' ? cashPaid.value : 0,
  });
}

// Reset tiap dibuka
watch(() => props.show, (open) => {
  if (open) {
    method.value = 'Tunai';
    cashPaid.value = props.total;
    bank.value = 'BCA';
  }
});
</script>
