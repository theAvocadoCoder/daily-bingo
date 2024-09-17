// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2024-09-12',
  devtools: { enabled: true },
  build: {
    transpile: ['vuetify'],
  },
  features: {
    inlineStyles: false
  },
  app: {
    head: {
      title: "Daily Bingo",
      meta: [
        {
          name: "description",
          content: "A fun little app to share with friends. What's on your bingo card today?"
        },
      ],
    }
  },
  modules: [
    "vuetify-nuxt-module",
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt"
  ],
  pinia: {
    storesDirs: ["./stores/**"]
  },
  css: [
    "./assets/scss/settings.scss",
  ],
  vuetify: {
    moduleOptions: {
      includeTransformAssetsUrls: true,
      styles: {
        configFile: "assets/scss/settings.scss",
      },
    },
    vuetifyOptions: {
      display: {
        mobileBreakpoint: 'xs',
        thresholds: {
          xs: 0,
          sm: 640,
          md: 768,
          lg: 1024,
          xl: 1280,
          xxl: 1536,
        },
      },
    }
  },
  nitro: {
    preset: "netlify"
  }
});