<template>
  <aside class="flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
    <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
      <h2 class="font-bold">🧾 Keranjang</h2>
      <button v-if="cart.length" class="text-xs text-brand-600 hover:underline" @click="clearCart">Kosongkan</button>
    </div>

    <!-- Daftar item -->
    <div class="flex-1 overflow-y-auto px-4 py-3">
      <p v-if="!cart.length" class="py-10 text-center text-sm text-slate-400">
        Keranjang masih kosong.<br />Klik menu untuk menambah.
      </p>
      <div v-for="item in cart" :key="item.key" class="mb-3 border-b border-slate-100 pb-3 last:border-0 dark:border-slate-800">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold">{{ item.emoji }} {{ item.name }}</p>
            <p v-if="item.spice_level" class="text-xs text-brand-600">🌶️ Level {{ item.spice_level }}</p>
            <p v-if="item.note" class="truncate text-xs italic text-slate-500">“{{ item.note }}”</p>
            <p class="text-xs text-slate-500">{{ formatRupiah(item.price) }} × {{ item.qty }}</p>
          </div>
          <p class="shrink-0 text-sm font-bold">{{ formatRupiah(item.price * item.qty) }}</p>
        </div>
        <div class="mt-2 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <button class="h-7 w-7 rounded-full border text-sm dark:border-slate-700" @click="updateQty(item.key, -1)">−</button>
            <span class="w-5 text-center text-sm font-bold">{{ item.qty }}</span>
            <button class="h-7 w-7 rounded-full border text-sm dark:border-slate-700" @click="updateQty(item.key, 1)">＋</button>
          </div>
          <button class="text-xs text-red-500 hover:underline" @click="removeItem(item.key)">Hapus</button>
        </div>
      </div>
    </div>

    <!-- Ringkasan -->
    <div class="border-t border-slate-100 px-4 py-3 dark:border-slate-800">
      <div class="mb-1 flex justify-between text-sm text-slate-600 dark:text-slate-300">
        <span>Subtotal</span><span>{{ formatRupiah(subtotal) }}</span>
      </div>
      <div class="mb-2 flex justify-between text-sm text-slate-600 dark:text-slate-300">
        <span>Pajak (10%)</span><span>{{ formatRupiah(tax) }}</span>
      </div>
      <div class="mb-3 flex justify-between text-base font-bold">
        <span>Total Akhir</span><span>{{ formatRupiah(total) }}</span>
      </div>
      <button
        :disabled="!cart.length"
        class="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
        @click="$emit('checkout')"
      >
        Bayar · {{ formatRupiah(total) }}
      </button>
    </div>
  </aside>
</template>

<script setup>
import { formatRupiah } from '~/utils/format';
import { usePos } from '~/composables/usePos';

defineEmits(['checkout']);
const { cart, subtotal, tax, total, updateQty, removeItem, clearCart } = usePos();
</script>
