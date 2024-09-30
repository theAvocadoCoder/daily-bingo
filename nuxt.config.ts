// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2024-09-12',
  devtools: { enabled: true },
  runtimeConfig: {
    authOrigin: process.env.AUTH_ORIGIN,
    authSecret: process.env.AUTH_SECRET,
    authClientId: process.env.AUTH_CLIENT_ID,
    authClientSecret: process.env.AUTH_CLIENT_SECRET,
    authIssuerBaseURL: process.env.AUTH_ISSUER_BASE_URL,
    auth0Domain: process.env.AUTH_0_DOMAIN,
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
    cloudinaryUrl: process.env.CLOUDINARY_URL,
  },
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
  modules: ["vuetify-nuxt-module", "@nuxtjs/tailwindcss", "@pinia/nuxt", "@sidebase/nuxt-auth"],
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
  },
  auth: {
    baseURL: `${process.env.AUTH_ORIGIN}/api/auth`,
    provider: {
      type: "authjs",
      defaultProvider: "auth0",
    },
    globalAppMiddleware: true,
  }
});