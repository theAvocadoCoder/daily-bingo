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
    dbName: process.env.DB_NAME,
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
    cloudinaryUrl: process.env.CLOUDINARY_URL,
    ablyRoot: process.env.ABLY_ROOT,
    public: {
      baseUrl: process.env.BASE_URL,
    }
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
        // {
        //   'http-equiv': 'Content-Security-Policy',
        //   content: "script-src 'self' https://clerk.accounts.dev;",
        // },
      ],
    }
  },
  modules: ["vuetify-nuxt-module", "@nuxtjs/tailwindcss", "@pinia/nuxt", "vue-clerk/nuxt", "@nuxt/test-utils/module"],
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
  clerk: {
    appearance: {
      variables: { colorPrimary: '#000000' },
      elements: {
        formButtonPrimary:
                'bg-black border border-black border-solid hover:bg-white hover:text-black',
        socialButtonsBlockButton:
                'bg-white border-gray-200 hover:bg-transparent hover:border-black text-gray-600 hover:text-black',
        socialButtonsBlockButtonText: 'font-semibold',
        formButtonReset:
                'bg-white border border-solid border-gray-200 hover:bg-transparent hover:border-black text-gray-500 hover:text-black',
        membersPageInviteButton:
                'bg-black border border-black border-solid hover:bg-white hover:text-black',
        card: 'bg-[#fafafa]',
      },
    },
  }
});