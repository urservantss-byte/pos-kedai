<template>
  <div class="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <!-- Sidebar desktop -->
    <aside class="no-print fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:flex">
      <div class="mb-6 flex items-center gap-2">
        <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-xl text-white">🍜</span>
        <div>
          <p class="font-bold leading-tight">POS Kedai</p>
          <p class="text-xs text-slate-500">Bakso · Seblak · Teh Poci</p>
        </div>
      </div>

      <nav class="flex flex-col gap-1">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          active-class="!bg-brand-600 !text-white"
        >
          {{ item.icon }} {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="mt-auto">
        <button
          class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          @click="toggleDark"
        >
          {{ isDark ? '☀️ Mode Terang' : '🌙 Mode Gelap' }}
        </button>
        <p class="mt-3 text-center text-[11px] text-slate-400">Kasir v1.0 · Pajak 10%</p>
      </div>
    </aside>

    <!-- Topbar mobile -->
    <header class="no-print sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 md:hidden">
      <p class="font-bold">🍜 POS Kedai</p>
      <button class="rounded-lg border px-2 py-1 text-sm" @click="toggleDark">{{ isDark ? '☀️' : '🌙' }}</button>
    </header>

    <!-- Konten -->
    <main class="md:pl-60">
      <NuxtPage />
    </main>

    <!-- Bottom nav mobile -->
    <nav class="no-print fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-slate-200 bg-white py-2 dark:border-slate-800 dark:bg-slate-900 md:hidden">
      <NuxtLink
        v-for="item in nav"
        :key="item.to"
        :to="item.to"
        class="flex flex-col items-center text-xs text-slate-500"
        active-class="!text-brand-600 font-semibold"
      >
        <span class="text-lg leading-none">{{ item.icon }}</span>
        {{ item.label }}
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const nav = [
  { to: '/', label: 'Kasir', icon: '🧾' },
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/produk', label: 'Produk', icon: '🍽️' },
  { to: '/riwayat', label: 'Riwayat', icon: '📜' },
];

const isDark = ref(false);

function toggleDark() {
  isDark.value = !isDark.value;
  document.documentElement.classList.toggle('dark', isDark.value);
  localStorage.setItem('pos-dark', isDark.value ? '1' : '0');
}

onMounted(() => {
  isDark.value = localStorage.getItem('pos-dark') === '1';
  document.documentElement.classList.toggle('dark', isDark.value);
});
</script>
