<template>
  <div class="mx-auto max-w-6xl p-4 md:p-6">
    <h1 class="mb-4 text-xl font-bold">📊 Dashboard</h1>

    <div v-if="loading" class="py-10 text-center text-sm text-slate-400">Memuat data…</div>
    <div v-else>
      <!-- Kartu ringkasan -->
      <div class="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <div class="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <p class="text-xs text-slate-500">Pendapatan Hari Ini</p>
          <p class="mt-1 text-2xl font-bold text-brand-600">{{ formatRupiah(data.todayRevenue) }}</p>
        </div>
        <div class="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <p class="text-xs text-slate-500">Jumlah Pesanan Hari Ini</p>
          <p class="mt-1 text-2xl font-bold">{{ data.todayOrders }} pesanan</p>
        </div>
        <div class="col-span-2 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900 lg:col-span-1">
          <p class="text-xs text-slate-500">Rata-rata per Pesanan</p>
          <p class="mt-1 text-2xl font-bold">
            {{ data.todayOrders ? formatRupiah(Math.round(data.todayRevenue / data.todayOrders)) : formatRupiah(0) }}
          </p>
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <!-- Best seller -->
        <div class="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <h2 class="mb-3 font-bold">🏆 Menu Paling Laris Hari Ini</h2>
          <p v-if="!data.bestSeller.length" class="text-sm text-slate-400">Belum ada penjualan hari ini.</p>
          <ol v-else class="space-y-2">
            <li
              v-for="(item, i) in data.bestSeller"
              :key="item.name"
              class="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800"
            >
              <span><b>{{ i + 1 }}.</b> {{ item.name }}</span>
              <span class="font-bold text-brand-600">{{ item.qty }} terjual</span>
            </li>
          </ol>
        </div>

        <!-- Pesanan terbaru -->
        <div class="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <h2 class="mb-3 font-bold">🕑 Pesanan Terbaru</h2>
          <p v-if="!data.recentOrders.length" class="text-sm text-slate-400">Belum ada pesanan.</p>
          <div v-else class="space-y-2">
            <div
              v-for="o in data.recentOrders"
              :key="o.id"
              class="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800"
            >
              <div>
                <p class="font-semibold">{{ o.receipt_no }}</p>
                <p class="text-xs text-slate-500">{{ o.payment_method }} · {{ o.items.reduce((s, i) => s + i.qty, 0) }} item</p>
              </div>
              <span class="font-bold">{{ formatRupiah(o.total) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { formatRupiah } from '~/utils/format';

const config = useRuntimeConfig();
const loading = ref(true);
const data = ref({ todayRevenue: 0, todayOrders: 0, bestSeller: [], recentOrders: [] });

onMounted(async () => {
  try {
    data.value = await $fetch(`${config.public.apiBase}/api/dashboard`);
  } finally {
    loading.value = false;
  }
});
</script>
