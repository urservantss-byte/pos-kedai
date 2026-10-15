// Konfigurasi Nuxt 3 untuk POS Kedai.
// Frontend jalan di port 3000, memanggil API backend di port 3001.
export default defineNuxtConfig({
  ssr: false, // POS adalah aplikasi interaktif — mode SPA lebih simpel & cepat
  modules: ['@nuxtjs/tailwindcss'],
  nitro: {
    // `nuxt generate` prerender semua halaman jadi HTML statis,
    // supaya bisa disajikan Express dari 1 service yang sama.
    prerender: { routes: ['/', '/dashboard', '/produk', '/riwayat'] },
  },
  runtimeConfig: {
    public: {
      // Produksi (build): '' = panggil API same-origin (/api/...) karena
      // frontend & backend disajikan 1 service yang sama di Railway.
      // Dev lokal: frontend :3000 memanggil backend :3001.
      // NUXT_PUBLIC_API_BASE yang diset eksplisit selalu menang.
      apiBase: process.env.NUXT_PUBLIC_API_BASE
        ?? (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001'),
    },
  },
  app: {
    head: {
      title: 'POS Kedai — Bakso, Seblak & Teh Poci',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    },
  },
});
