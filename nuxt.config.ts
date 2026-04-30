export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@vueuse/nuxt'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production',
    databaseUrl: process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/benovl',
    public: {
      appName: 'BénoVL Intranet'
    }
  },
  typescript: {
    strict: true
  },
  nitro: {
    experimental: {
      database: false
    }
  }
})
