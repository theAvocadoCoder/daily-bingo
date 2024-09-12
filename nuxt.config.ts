// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  build: {
    transpile: ['vuetify'],
  },
  imports: {
    dirs: ["./stores"],
  },
  modules: [
    "vuetify-nuxt-module",
    "@nuxtjs/tailwindcss",
    // "@pinia/nuxt",
  ],
  vuetify: {
    moduleOptions: {
      includeTransformAssetsUrls: true,
      disableVuetifyStyles: true,
    }
  },
});