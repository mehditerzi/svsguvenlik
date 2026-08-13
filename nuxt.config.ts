export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss', '@nuxt/image'],
  css: [
    '@fontsource-variable/archivo/wght.css',
    '@fontsource-variable/archivo/wght-italic.css',
    '@fontsource/instrument-serif/400.css',
    '@fontsource-variable/jetbrains-mono/wght.css',
    '~/assets/css/main.scss'
  ],
  image: {
    quality: 82,
    format: ['webp'],
    screens: { xs: 390, sm: 640, md: 900, lg: 1280, xl: 1600, xxl: 2200 }
  },
  site: { url: 'https://svsguvenlik.mehditerzi.com' },

  /**
   * Build output is hash-named and already immutable. The generated media in
   * /public isn't hashed, so it gets a week of caching plus a revalidation
   * window rather than `immutable` — repeat visits stay instant, and a
   * regenerated plate still propagates.
   */
  routeRules: {
    '/media/**': {
      headers: { 'cache-control': 'public, max-age=604800, stale-while-revalidate=86400' }
    },
    '/favicon.png': {
      headers: { 'cache-control': 'public, max-age=604800, stale-while-revalidate=86400' }
    }
  },

  app: {
    pageTransition: false,
    layoutTransition: false,
    head: {
      htmlAttrs: { lang: 'tr' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#0A0B0D' },
        {
          name: 'description',
          content:
            'SVS Shadow VIP Security — hastane, plaza ve tesislerde özel güvenlik, tesis yönetimi, güvenlik teknolojileri ve saha operasyonlarını tek komuta altında yöneten entegre hizmet grubu.'
        },
        // social cards
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'SVS Shadow VIP Security' },
        { property: 'og:locale', content: 'tr_TR' },
        { property: 'og:title', content: 'SVS Shadow VIP Security — Sahayı gören güvenlik' },
        {
          property: 'og:description',
          content:
            'Özel güvenlik, tesis yönetimi ve güvenlik teknolojilerini tek operasyon masasında birleştiriyoruz. 81 ilde 7/24 komuta merkezi.'
        },
        { property: 'og:image', content: 'https://svsguvenlik.mehditerzi.com/media/og.jpg' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:url', content: 'https://svsguvenlik.mehditerzi.com/' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'SVS Shadow VIP Security — Sahayı gören güvenlik' },
        { name: 'twitter:image', content: 'https://svsguvenlik.mehditerzi.com/media/og.jpg' }
      ],
      link: [
        { rel: 'icon', href: '/favicon.png', type: 'image/png' },
        { rel: 'apple-touch-icon', href: '/favicon.png' },
        { rel: 'canonical', href: 'https://svsguvenlik.mehditerzi.com/' }
      ]
    }
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: { api: 'modern-compiler', additionalData: '@use "~/assets/css/_tokens.scss" as *;' }
      }
    }
  },
  typescript: { strict: true }
})
