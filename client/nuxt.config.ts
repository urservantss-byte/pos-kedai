// Konfigurasi Nuxt 3 untuk POS Kedai.
// Frontend jalan di port 3000, memanggil API backend di port 3001.
export default defineNuxtConfig({
  ssr: false, // POS adalah aplikasi interaktif — mode SPA lebih simpel & cepat
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001',
    },
  },
  app: {
    head: {
      title: 'POS Kedai — Bakso, Seblak & Teh Poci',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    },
  },
});
