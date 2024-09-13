// import { md3 } from 'vuetify/blueprints'
import { defineVuetifyConfiguration } from 'vuetify-nuxt-module/custom-configuration';

// https://nuxt.vuetifyjs.com/guide/
export default defineVuetifyConfiguration({
  // blueprint: md3,

  ssr: {
    clientWidth: 100,
    // clientHeight: 100,
  },

  directives: true, // can take an array as well

  labComponents: true,

  defaults: {
    global: {
      ripple: true,
    },
  },

  display: {
    mobileBreakpoint: 'xs',
    // thresholds: {
    //   xs: 0,
    //   sm: 600,
    //   md: 960,
    //   lg: 1280,
    //   xl: 1920,
    //   xxl: 2560,
    // },
    // Using Tailwind ones here
    thresholds: {
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },

  icons: {
    defaultSet: 'mdi',
  },
})