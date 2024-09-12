// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  ssr: true,
  // compatibilityDate: '2024-09-12',
  devtools: { enabled: true },
  build: {
    transpile: ['vuetify'],
  },
  features: {
    inlineStyles: false
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
    "./assets/scss/settings.scss"
  ],
  vuetify: {
    moduleOptions: {
      includeTransformAssetsUrls: true,
      // disableVuetifyStyles: true,
      styles: {
        configFile: "assets/scss/settings.scss"
      }
    },
    vuetifyOptions: "./vuetify.config.ts"
  },
});