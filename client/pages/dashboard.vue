<template>
  <div class="mx-auto max-w-6xl p-4 md:p-6">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-bold">📊 Dashboard</h1>
      <button
        :disabled="loading || exporting"
        class="rounded-xl bg-tea-600 px-4 py-2 text-sm font-semibold text-white hover:bg-tea-700 disabled:cursor-not-allowed disabled:opacity-50"
        @click="exportLaporan"
      >
        {{ exporting ? 'Menyiapkan…' : '📥 Export Laporan' }}
      </button>
    </div>
    <p v-if="exportError" class="mb-3 text-sm text-red-500">{{ exportError }}</p>

    <div v-if="loading" class="py-10 text-center text-sm text-slate-400">Memuat data…</div>
    <div v-else>
      <!-- ⚠️ Alert stok menipis / habis -->
      <div
        v-if="data.lowStock.length"
        class="mb-5 rounded-2xl border p-4"
        :class="hasEmptyStock
          ? 'border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/40'
          : 'border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40'"
      >
        <p class="font-bold" :class="hasEmptyStock ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'">
          {{ hasEmptyStock ? '🚨 Stok Habis!' : '⚠️ Stok Menipis!' }}
          <span class="font-normal text-slate-600 dark:text-slate-300">
            {{ data.lowStock.length }} menu tersisa kurang dari 5 porsi — segera restock.
          </span>
        </p>
        <ul class="mt-3 space-y-1.5">
          <li
            v-for="p in data.lowStock"
            :key="p.id"
            class="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/70 px-3 py-2 text-sm dark:bg-slate-900/60"
          >
            <span>{{ p.emoji }} <b>{{ p.name }}</b> <span class="text-slate-500">· {{ p.category }}</span></span>
            <span
              class="rounded-full px-2.5 py-0.5 text-xs font-bold"
              :class="p.stock === 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200'"
            >
              {{ p.stock === 0 ? 'HABIS' : `Sisa ${p.stock} porsi` }}
            </span>
          </li>
        </ul>
      </div>

      <!-- 📈 Laporan Penjualan -->
      <h2 class="mb-3 font-bold">📈 Laporan Penjualan</h2>
      <div class="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div class="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <p class="text-xs text-slate-500">Pendapatan Hari Ini</p>
          <p class="mt-1 text-2xl font-bold text-brand-600">{{ formatRupiah(data.todayRevenue) }}</p>
        </div>
        <div class="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <p class="text-xs text-slate-500">Transaksi Hari Ini</p>
          <p class="mt-1 text-2xl font-bold">{{ data.todayOrders }} transaksi</p>
        </div>
        <div class="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <p class="text-xs text-slate-500">Pendapatan Minggu Ini</p>
          <p class="mt-1 text-2xl font-bold text-tea-600">{{ formatRupiah(data.weekRevenue) }}</p>
        </div>
        <div class="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <p class="text-xs text-slate-500">Transaksi Minggu Ini</p>
          <p class="mt-1 text-2xl font-bold">{{ data.weekOrders }} transaksi</p>
        </div>
      </div>

      <!-- Grafik batang 7 hari terakhir -->
      <div class="mb-6 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
        <h3 class="mb-1 font-bold">Pendapatan 7 Hari Terakhir</h3>
        <p class="mb-4 text-xs text-slate-500">Per hari · Senin–Minggu berjalan untuk kartu Minggu Ini di atas.</p>
        <div class="flex h-36 items-end gap-2 md:gap-4">
          <div v-for="d in data.dailyRevenue" :key="d.date" class="flex flex-1 flex-col items-center justify-end gap-1">
            <span class="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{{ compactRupiah(d.revenue) }}</span>
            <div
              class="w-full max-w-10 rounded-t-lg"
              :class="d.revenue > 0 ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700'"
              :style="{ height: barHeight(d.revenue) + '%' }"
              :title="`${d.label}: ${formatRupiah(d.revenue)} (${d.orders} transaksi)`"
            ></div>
            <span class="text-[11px] text-slate-500">{{ d.label }}</span>
          </div>
        </div>
      </div>

      <!-- 🧾 5 Transaksi Terakhir -->
      <div class="mb-6 overflow-x-auto rounded-2xl bg-white shadow-sm dark:bg-slate-900">
        <div class="flex items-center justify-between px-4 pt-4">
          <h2 class="font-bold">🧾 5 Transaksi Terakhir</h2>
          <span class="rounded-full bg-tea-100 px-2.5 py-1 text-xs font-semibold text-tea-700 dark:bg-tea-900/40">Real-time</span>
        </div>
        <table v-if="recentFive.length" class="mt-2 w-full min-w-[640px] text-left text-sm">
          <thead class="border-b border-slate-100 text-xs text-slate-500 dark:border-slate-800">
            <tr>
              <th class="px-4 py-3">Waktu</th>
              <th class="px-4 py-3">Nomor Struk</th>
              <th class="px-4 py-3">Item yang Dibeli</th>
              <th class="px-4 py-3 text-right">Total Pembayaran</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in recentFive" :key="o.id" class="border-b border-slate-50 last:border-0 dark:border-slate-800">
              <td class="px-4 py-3 text-slate-600 dark:text-slate-300">{{ formatWaktu(o.created_at) }}</td>
              <td class="px-4 py-3">
                <p class="font-semibold">{{ o.receipt_no }}</p>
                <p class="text-xs text-slate-500">{{ o.payment_method }}</p>
              </td>
              <td class="px-4 py-3">{{ itemsText(o.items) }}</td>
              <td class="px-4 py-3 text-right font-bold">{{ formatRupiah(o.total) }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="px-4 py-8 text-center text-sm text-slate-400">
          Belum ada transaksi — buat pesanan pertama di halaman Kasir.
        </p>
      </div>

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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { formatRupiah } from '~/utils/format';
import { useExportExcel } from '~/composables/useExportExcel';

const config = useRuntimeConfig();
const loading = ref(true);
const exporting = ref(false);
const exportError = ref('');
const data = ref({
  todayRevenue: 0, todayOrders: 0, weekRevenue: 0, weekOrders: 0,
  dailyRevenue: [], lowStock: [], bestSeller: [], recentOrders: [],
});

const hasEmptyStock = computed(() => data.value.lowStock.some((p) => p.stock === 0));
const recentFive = computed(() => data.value.recentOrders.slice(0, 5));
const maxDaily = computed(() => Math.max(0, ...data.value.dailyRevenue.map((d) => d.revenue)));

function barHeight(revenue) {
  if (!maxDaily.value) return 2;
  return Math.max(2, Math.round((revenue / maxDaily.value) * 88));
}

function compactRupiah(v) {
  if (v >= 1000) return `Rp ${Math.round(v / 1000)}rb`;
  return formatRupiah(v);
}

function formatWaktu(s) {
  const d = new Date(String(s).replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return String(s);
  return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function itemsText(items) {
  return (items || []).map((i) => `${i.name} ×${i.qty}`).join(', ');
}

async function exportLaporan() {
  exportError.value = '';
  exporting.value = true;
  try {
    const { downloadLaporanExcel } = useExportExcel();
    const first = data.value.dailyRevenue[0];
    const last = data.value.dailyRevenue[data.value.dailyRevenue.length - 1];
    const periodLabel = first && last
      ? `7 hari terakhir (${first.date} s.d. ${last.date})`
      : new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    downloadLaporanExcel({
      summary: {
        todayRevenue: data.value.todayRevenue,
        todayOrders: data.value.todayOrders,
        weekRevenue: data.value.weekRevenue,
        weekOrders: data.value.weekOrders,
      },
      transactions: recentFive.value,
      lowStock: data.value.lowStock,
      periodLabel,
    });
  } catch (e) {
    exportError.value = 'Gagal mengekspor laporan. Coba lagi.';
  } finally {
    exporting.value = false;
  }
}

onMounted(async () => {
  try {
    data.value = await $fetch(`${config.public.apiBase}/api/dashboard`);
  } finally {
    loading.value = false;
  }
});
</script>
