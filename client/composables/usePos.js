/**
 * usePos — state global POS (singleton).
 * Dipakai bersama oleh halaman Kasir, CartPanel, dan modal pembayaran.
 * Total dihitung di frontend HANYA untuk tampilan; total resmi dihitung
 * ulang oleh server saat checkout (POST /api/orders).
 */
import { ref, computed } from 'vue';

const products = ref([]);
const cart = ref([]); // { key, product_id, name, price, emoji, qty, note, spice_level }
const activeCategory = ref('Semua');
const search = ref('');
const loading = ref(false);

export const CATEGORIES = ['Semua', 'Bakso', 'Seblak', 'Minuman', 'Topping/Ekstra'];
export const TAX_RATE = 0.1;

export function usePos() {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase;

  async function loadProducts() {
    loading.value = true;
    try {
      const params = new URLSearchParams();
      if (activeCategory.value !== 'Semua') params.set('category', activeCategory.value);
      if (search.value.trim()) params.set('search', search.value.trim());
      products.value = await $fetch(`${apiBase}/api/products?${params.toString()}`);
    } finally {
      loading.value = false;
    }
  }

  function cartKey(product, opts) {
    return `${product.id}|${opts.spice_level || ''}|${opts.note || ''}`;
  }

  function addToCart(product, opts = {}) {
    const key = cartKey(product, opts);
    const existing = cart.value.find((i) => i.key === key);
    if (existing) {
      existing.qty += opts.qty || 1;
      return;
    }
    cart.value.push({
      key,
      product_id: product.id,
      name: product.name,
      price: product.price,
      emoji: product.emoji,
      qty: opts.qty || 1,
      note: opts.note || '',
      spice_level: opts.spice_level || null,
    });
  }

  function updateQty(key, delta) {
    const item = cart.value.find((i) => i.key === key);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) removeItem(key);
  }

  function removeItem(key) {
    cart.value = cart.value.filter((i) => i.key !== key);
  }

  function clearCart() {
    cart.value = [];
  }

  const subtotal = computed(() => cart.value.reduce((s, i) => s + i.price * i.qty, 0));
  const tax = computed(() => Math.round(subtotal.value * TAX_RATE));
  const total = computed(() => subtotal.value + tax.value);
  const cartCount = computed(() => cart.value.reduce((s, i) => s + i.qty, 0));

  return {
    products, cart, activeCategory, search, loading,
    loadProducts, addToCart, updateQty, removeItem, clearCart,
    subtotal, tax, total, cartCount,
  };
}
