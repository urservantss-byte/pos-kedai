<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" @click.self="$emit('close')">
    <div class="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl dark:bg-slate-900 sm:rounded-2xl">
      <div class="mb-4 flex items-start justify-between">
        <div>
          <h3 class="text-lg font-bold">{{ product.name }}</h3>
          <p class="text-sm text-brand-600 dark:text-brand-400">{{ formatRupiah(product.price) }}</p>
        </div>
        <button class="rounded-full bg-slate-100 px-3 py-1 text-sm dark:bg-slate-800" @click="$emit('close')">✕</button>
      </div>

      <!-- Level pedas — hanya untuk Seblak -->
      <div v-if="product.has_spice_level" class="mb-4">
        <p class="mb-2 text-sm font-semibold">Level Pedas</p>
        <div class="flex gap-2">
          <button
            v-for="lvl in 5"
            :key="lvl"
            class="h-11 flex-1 rounded-xl border text-sm font-bold transition"
            :class="spiceLevel === lvl
              ? 'border-brand-600 bg-brand-600 text-white'
              : 'border-slate-200 hover:border-brand-400 dark:border-slate-700'"
            @click="spiceLevel = lvl"
          >
            {{ lvl }}
          </button>
        </div>
        <p class="mt-1 text-xs text-slate-500">{{ spiceLabel }}</p>
      </div>

      <!-- Catatan khusus -->
      <div class="mb-4">
        <p class="mb-2 text-sm font-semibold">Catatan Khusus</p>
        <div class="mb-2 flex flex-wrap gap-1.5">
          <button
            v-for="chip in quickNotes"
            :key="chip"
            class="rounded-full border border-slate-200 px-2.5 py-1 text-xs hover:border-brand-400 dark:border-slate-700"
            @click="toggleChip(chip)"
          >
            {{ chip }}
          </button>
        </div>
        <input
          v-model="note"
          type="text"
          maxlength="200"
          placeholder="mis: tanpa mie, gula sedikit, es dikit…"
          class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
        />
      </div>

      <!-- Jumlah -->
      <div class="mb-5 flex items-center justify-between">
        <p class="text-sm font-semibold">Jumlah</p>
        <div class="flex items-center gap-3">
          <button class="h-9 w-9 rounded-full border text-lg dark:border-slate-700" @click="qty = Math.max(1, qty - 1)">−</button>
          <span class="w-8 text-center text-lg font-bold">{{ qty }}</span>
          <button class="h-9 w-9 rounded-full border text-lg dark:border-slate-700" @click="qty++">＋</button>
        </div>
      </div>

      <button
        class="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700"
        @click="confirm"
      >
        Tambah · {{ formatRupiah(product.price * qty) }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { formatRupiah } from '~/utils/format';

const props = defineProps({
  show: { type: Boolean, default: false },
  product: { type: Object, default: null },
});
const emit = defineEmits(['close', 'confirm']);

const qty = ref(1);
const note = ref('');
const spiceLevel = ref(3);

const quickNotes = ['Tanpa mie', 'Gula sedikit', 'Es dikit', 'Tanpa es', 'Kuah banyak', 'Pisah kuah', 'Extra pedas'];

const spiceLabel = computed(() => {
  const labels = { 1: 'Tidak pedas', 2: 'Sedikit pedas', 3: 'Sedang', 4: 'Pedas', 5: 'Pedas banget 🔥' };
  return labels[spiceLevel.value] || '';
});

function toggleChip(chip) {
  const parts = note.value.split(', ').filter(Boolean);
  const idx = parts.indexOf(chip);
  if (idx >= 0) parts.splice(idx, 1);
  else parts.push(chip);
  note.value = parts.join(', ');
}

function confirm() {
  emit('confirm', {
    qty: qty.value,
    note: note.value.trim(),
    spice_level: props.product?.has_spice_level ? spiceLevel.value : null,
  });
}

// Reset tiap kali produk baru dibuka
watch(() => props.product, () => {
  qty.value = 1;
  note.value = '';
  spiceLevel.value = 3;
});
</script>
