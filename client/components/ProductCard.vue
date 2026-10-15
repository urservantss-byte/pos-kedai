<template>
  <button
    :disabled="!product.available"
    class="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900"
    @click="$emit('add', product)"
  >
    <!-- Foto / tile -->
    <div class="relative h-28 w-full sm:h-32" :class="tileClass">
      <img
        v-if="product.image"
        :src="product.image"
        :alt="product.name"
        class="h-full w-full object-cover"
      />
      <span v-else class="flex h-full w-full items-center justify-center text-5xl">{{ product.emoji }}</span>
      <span
        v-if="product.has_spice_level"
        class="absolute left-2 top-2 rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-semibold text-white"
      >
        🌶️ Level 1–5
      </span>
      <span
        v-if="!product.available"
        class="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-bold text-white"
      >
        HABIS
      </span>
    </div>

    <div class="p-3">
      <p class="truncate text-sm font-semibold">{{ product.name }}</p>
      <p class="mt-0.5 line-clamp-2 min-h-[2rem] text-xs text-slate-500 dark:text-slate-400">
        {{ product.description }}
      </p>
      <div class="mt-2 flex items-center justify-between">
        <span class="text-sm font-bold text-brand-600 dark:text-brand-400">{{ formatRupiah(product.price) }}</span>
        <span class="rounded-full bg-brand-50 px-2 py-1 text-base leading-none text-brand-600 dark:bg-brand-900/40">＋</span>
      </div>
    </div>
  </button>
</template>

<script setup>
import { computed } from 'vue';
import { formatRupiah } from '~/utils/format';

const props = defineProps({ product: { type: Object, required: true } });
defineEmits(['add']);

// Gradasi tile per kategori (kalau belum ada foto)
const tileClass = computed(() => {
  switch (props.product.category) {
    case 'Bakso': return 'bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/40 dark:to-red-900/40';
    case 'Seblak': return 'bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/40 dark:to-rose-900/40';
    case 'Minuman': return 'bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40';
    default: return 'bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/40';
  }
});
</script>
