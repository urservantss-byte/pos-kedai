<template>
  <div class="mx-auto max-w-6xl p-4 md:p-6">
    <h1 class="mb-4 text-xl font-bold">📜 Riwayat Transaksi</h1>

    <div class="overflow-x-auto rounded-2xl bg-white shadow-sm dark:bg-slate-900">
      <table class="w-full min-w-[640px] text-left text-sm">
        <thead class="border-b border-slate-100 text-xs text-slate-500 dark:border-slate-800">
          <tr>
            <th class="px-4 py-3">No. Struk</th>
            <th class="px-4 py-3">Waktu</th>
            <th class="px-4 py-3">Item</th>
            <th class="px-4 py-3">Metode</th>
            <th class="px-4 py-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="o in orders"
            :key="o.id"
            class="cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
            @click="selected = selected?.id === o.id ? null : o"
          >
            <td class="px-4 py-3 font-mono font-semibold">{{ o.receipt_no }}</td>
            <td class="px-4 py-3">{{ formatDate(o.created_at) }}</td>
            <td class="px-4 py-3">{{ o.items.reduce((s, i) => s + i.qty, 0) }} item</td>
            <td class="px-4 py-3">{{ o.payment_method }}</td>
            <td class="px-4 py-3 text-right font-bold">{{ formatRupiah(o.total) }}</td>
          </tr>
        </tbody>
      </table>
      <p v-if="!orders.length" class="py-8 text-center text-sm text-slate-400">Belum ada transaksi.</p>
    </div>

    <!-- Detail struk -->
    <div v-if="selected" class="mt-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
      <div class="mb-2 flex items-center justify-between">
        <h2 class="font-bold">Detail {{ selected.receipt_no }}</h2>
        <button class="text-sm text-slate-400" @click="selected = null">✕ Tutup</button>
      </div>
      <div class="space-y-1 text-sm">
        <div v-for="item in selected.items" :key="item.product_id + item.note + item.spice_level" class="flex justify-between gap-4">
          <span>
            {{ item.name }} × {{ item.qty }}
            <span v-if="item.spice_level" class="text-brand-600">(Level {{ item.spice_level }})</span>
            <span v-if="item.note" class="italic text-slate-500">— {{ item.note }}</span>
          </span>
          <span>{{ formatRupiah(item.price * item.qty) }}</span>
        </div>
        <div class="flex justify-between border-t border-dashed pt-2"><span>Subtotal</span><span>{{ formatRupiah(selected.subtotal) }}</span></div>
        <div class="flex justify-between"><span>Pajak (10%)</span><span>{{ formatRupiah(selected.tax) }}</span></div>
        <div class="flex justify-between font-bold"><span>Total</span><span>{{ formatRupiah(selected.total) }}</span></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { formatRupiah } from '~/utils/format';

const config = useRuntimeConfig();
const orders = ref([]);
const selected = ref(null);

function formatDate(s) {
  return new Date(s.replace(' ', 'T')).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

onMounted(async () => {
  orders.value = await $fetch(`${config.public.apiBase}/api/orders`);
});
</script>
