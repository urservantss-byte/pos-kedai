<template>
  <div class="mx-auto max-w-6xl p-4 md:p-6">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-bold">🍽️ Manajemen Produk</h1>
      <button class="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700" @click="openForm()">
        ＋ Tambah Menu
      </button>
    </div>

    <!-- Form tambah / ubah -->
    <form
      v-if="showForm"
      class="mb-5 grid gap-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900 md:grid-cols-2"
      @submit.prevent="saveProduct"
    >
      <div>
        <label class="text-xs font-semibold text-slate-500">Nama Menu *</label>
        <input v-model="form.name" required type="text" placeholder="mis: Bakso Urat" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800" />
      </div>
      <div>
        <label class="text-xs font-semibold text-slate-500">Kategori *</label>
        <select v-model="form.category" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800">
          <option v-for="c in ['Bakso', 'Seblak', 'Minuman', 'Topping/Ekstra']" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
      <div>
        <label class="text-xs font-semibold text-slate-500">Harga (Rp) *</label>
        <input v-model.number="form.price" required type="number" min="0" step="100" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800" />
      </div>
      <div>
        <label class="text-xs font-semibold text-slate-500">Emoji / Ikon</label>
        <input v-model="form.emoji" type="text" placeholder="🍜" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800" />
      </div>
      <div class="md:col-span-2">
        <label class="text-xs font-semibold text-slate-500">URL Foto (opsional — kosong = pakai tile emoji)</label>
        <input v-model="form.image" type="url" placeholder="https://…" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800" />
      </div>
      <div class="md:col-span-2">
        <label class="text-xs font-semibold text-slate-500">Deskripsi</label>
        <input v-model="form.description" type="text" placeholder="Deskripsi singkat menu" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800" />
      </div>
      <label class="flex items-center gap-2 text-sm">
        <input v-model="form.has_spice_level" type="checkbox" /> Punya level pedas 1–5 (Seblak)
      </label>
      <label class="flex items-center gap-2 text-sm">
        <input v-model="form.available" type="checkbox" /> Tersedia (matikan = Habis)
      </label>
      <div class="flex gap-2 md:col-span-2">
        <button type="submit" class="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          {{ editing ? 'Simpan Perubahan' : 'Tambah Menu' }}
        </button>
        <button type="button" class="rounded-xl border px-5 py-2.5 text-sm dark:border-slate-600" @click="closeForm">Batal</button>
      </div>
      <p v-if="formError" class="text-sm text-red-500 md:col-span-2">{{ formError }}</p>
    </form>

    <!-- Tabel produk -->
    <div class="overflow-x-auto rounded-2xl bg-white shadow-sm dark:bg-slate-900">
      <table class="w-full min-w-[640px] text-left text-sm">
        <thead class="border-b border-slate-100 text-xs text-slate-500 dark:border-slate-800">
          <tr>
            <th class="px-4 py-3">Menu</th>
            <th class="px-4 py-3">Kategori</th>
            <th class="px-4 py-3">Harga</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in products" :key="p.id" class="border-b border-slate-50 last:border-0 dark:border-slate-800">
            <td class="px-4 py-3 font-medium">{{ p.emoji }} {{ p.name }}</td>
            <td class="px-4 py-3">{{ p.category }}</td>
            <td class="px-4 py-3">{{ formatRupiah(p.price) }}</td>
            <td class="px-4 py-3">
              <button
                class="rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="p.available ? 'bg-tea-100 text-tea-700 dark:bg-tea-900/40' : 'bg-red-100 text-red-700 dark:bg-red-900/40'"
                @click="toggleAvailable(p)"
              >
                {{ p.available ? 'Tersedia' : 'Habis' }}
              </button>
            </td>
            <td class="px-4 py-3 text-right">
              <button class="mr-2 text-brand-600 hover:underline" @click="openForm(p)">Ubah</button>
              <button class="text-red-500 hover:underline" @click="deleteProduct(p)">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!products.length" class="py-8 text-center text-sm text-slate-400">Belum ada produk.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { formatRupiah } from '~/utils/format';

const config = useRuntimeConfig();
const products = ref([]);
const showForm = ref(false);
const editing = ref(null);
const formError = ref('');

const emptyForm = () => ({
  name: '', category: 'Bakso', price: 0, emoji: '🍽️',
  image: '', description: '', has_spice_level: false, available: true,
});
const form = ref(emptyForm());

async function loadProducts() {
  products.value = await $fetch(`${config.public.apiBase}/api/products`);
}

function openForm(p = null) {
  editing.value = p;
  form.value = p ? { ...p } : emptyForm();
  formError.value = '';
  showForm.value = true;
}

function closeForm() {
  showForm.value = false;
  editing.value = null;
}

async function saveProduct() {
  formError.value = '';
  try {
    if (editing.value) {
      await $fetch(`${config.public.apiBase}/api/products/${editing.value.id}`, {
        method: 'PUT', body: form.value,
      });
    } else {
      await $fetch(`${config.public.apiBase}/api/products`, {
        method: 'POST', body: form.value,
      });
    }
    closeForm();
    await loadProducts();
  } catch (e) {
    formError.value = e?.data?.error || 'Gagal menyimpan produk.';
  }
}

async function toggleAvailable(p) {
  await $fetch(`${config.public.apiBase}/api/products/${p.id}/availability`, {
    method: 'PATCH', body: { available: !p.available },
  });
  await loadProducts();
}

async function deleteProduct(p) {
  if (!confirm(`Hapus "${p.name}"?`)) return;
  await $fetch(`${config.public.apiBase}/api/products/${p.id}`, { method: 'DELETE' });
  await loadProducts();
}

onMounted(loadProducts);
</script>
