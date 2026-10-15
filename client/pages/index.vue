<template>
  <div class="flex h-[calc(100vh-57px)] flex-col md:h-screen">
    <!-- Header kasir: judul + pencarian -->
    <header class="no-print flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 md:px-6">
      <div>
        <h1 class="text-lg font-bold leading-tight">Kasir</h1>
        <p class="text-xs text-slate-500">{{ todayLabel }}</p>
      </div>
      <div class="relative ml-auto w-full sm:w-72">
        <input
          v-model="search"
          type="text"
          placeholder="Cari menu… (mis: bakso, seblak, teh)"
          class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pl-9 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
          @input="debouncedLoad"
        />
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
      </div>
    </header>

    <!-- Filter kategori -->
    <div class="no-print flex gap-2 overflow-x-auto px-4 py-3 md:px-6">
      <button
        v-for="cat in CATEGORIES"
        :key="cat"
        class="shrink-0 rounded-full px-4 py-2 text-sm font-medium transition"
        :class="activeCategory === cat
          ? 'bg-brand-600 text-white shadow'
          : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'"
        @click="setCategory(cat)"
      >
        {{ cat }}
      </button>
    </div>

    <!-- Area utama: grid menu + keranjang -->
    <div class="flex min-h-0 flex-1 gap-4 px-4 pb-20 md:px-6 md:pb-4">
      <!-- Grid produk -->
      <section class="min-w-0 flex-1 overflow-y-auto pr-0.5">
        <p v-if="loading" class="py-10 text-center text-sm text-slate-400">Memuat menu…</p>
        <p v-else-if="!products.length" class="py-10 text-center text-sm text-slate-400">
          Menu tidak ditemukan. Coba kata kunci / kategori lain.
        </p>
        <div v-else class="grid grid-cols-2 gap-3 pb-4 sm:grid-cols-3 xl:grid-cols-4">
          <ProductCard
            v-for="p in products"
            :key="p.id"
            :product="p"
            @add="openOptions"
          />
        </div>
      </section>

      <!-- Keranjang desktop -->
      <div class="hidden w-[360px] shrink-0 md:block">
        <CartPanel @checkout="showPayment = true" />
      </div>
    </div>

    <!-- Tombol keranjang mobile (floating) -->
    <button
      v-if="cartCount > 0"
      class="no-print fixed bottom-20 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-brand-600 px-5 py-3 font-semibold text-white shadow-lg md:hidden"
      @click="showMobileCart = true"
    >
      🧾 Lihat Keranjang ({{ cartCount }}) · {{ formatRupiah(total) }}
    </button>

    <!-- Drawer keranjang mobile -->
    <div v-if="showMobileCart" class="fixed inset-0 z-50 bg-black/50 md:hidden" @click.self="showMobileCart = false">
      <div class="absolute inset-x-0 bottom-0 h-[85vh]">
        <CartPanel @checkout="showMobileCart = false; showPayment = true" />
      </div>
    </div>

    <!-- Modal kustomisasi pesanan -->
    <ProductOptionsModal
      :show="!!optionsProduct"
      :product="optionsProduct"
      @close="optionsProduct = null"
      @confirm="confirmAdd"
    />

    <!-- Modal pembayaran -->
    <PaymentModal
      :show="showPayment"
      :total="total"
      @close="showPayment = false"
      @confirm="checkout"
    />

    <!-- Struk -->
    <ReceiptModal
      :show="!!lastOrder"
      :order="lastOrder"
      @close="lastOrder = null"
      @new-transaction="lastOrder = null"
    />

    <p v-if="error" class="no-print fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-red-600 px-4 py-2 text-sm text-white shadow-lg md:bottom-6">
      {{ error }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import ProductCard from '~/components/ProductCard.vue';
import ProductOptionsModal from '~/components/ProductOptionsModal.vue';
import CartPanel from '~/components/CartPanel.vue';
import PaymentModal from '~/components/PaymentModal.vue';
import ReceiptModal from '~/components/ReceiptModal.vue';
import { usePos, CATEGORIES } from '~/composables/usePos';
import { formatRupiah } from '~/utils/format';

const {
  products, cart, activeCategory, search, loading,
  loadProducts, addToCart, clearCart, total, cartCount,
} = usePos();

const config = useRuntimeConfig();
const optionsProduct = ref(null);
const showPayment = ref(false);
const showMobileCart = ref(false);
const lastOrder = ref(null);
const error = ref('');

const todayLabel = computed(() => new Date().toLocaleDateString('id-ID', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
}));

let debounceTimer = null;
function debouncedLoad() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(loadProducts, 300);
}

function setCategory(cat) {
  activeCategory.value = cat;
  loadProducts();
}

function openOptions(product) {
  if (!product.available) return;
  optionsProduct.value = product;
}

function confirmAdd(opts) {
  if (!optionsProduct.value) return;
  addToCart(optionsProduct.value, opts);
  optionsProduct.value = null;
}

async function checkout(payment) {
  error.value = '';
  try {
    const payload = {
      items: cart.value.map((i) => ({
        product_id: i.product_id,
        qty: i.qty,
        note: i.note,
        spice_level: i.spice_level,
      })),
      payment_method: payment.method,
      cash_paid: payment.cash_paid,
    };
    lastOrder.value = await $fetch(`${config.public.apiBase}/api/orders`, {
      method: 'POST',
      body: payload,
    });
    showPayment.value = false;
    clearCart();
    loadProducts(); // refresh status Habis bila ada perubahan stok
  } catch (e) {
    error.value = e?.data?.error || 'Gagal memproses pembayaran. Coba lagi.';
    setTimeout(() => { error.value = ''; }, 4000);
  }
}

onMounted(loadProducts);
</script>
