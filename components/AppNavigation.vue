<template>
  <v-bottom-navigation 
    :elevation="0" 
    mode="shift" 
    :class="`${smAndUp ? 'position-sticky top-0' : 'position-fixed bottom-0'}`"
    bg-color="teal-lighten-5"
  >
    <nuxt-link to="/bingo">
      <v-btn class="text-teal-darken-4" value="bingo">
        <v-icon class="text-teal-darken-4">mdi-account-group</v-icon>
        <span>Bingo</span>
      </v-btn>
    </nuxt-link>

    <nuxt-link to="/">
      <v-btn class="text-teal-darken-4" value="home">
        <v-icon class="text-teal-darken-4">mdi-home</v-icon>
        <span>Home</span>
      </v-btn>
    </nuxt-link>

    <nuxt-link to="/canvas">
      <v-btn class="text-teal-darken-4" value="canvas">
        <v-icon class="text-teal-darken-4">mdi-account-circle</v-icon>
        <span>Canvas</span>
      </v-btn>
    </nuxt-link>
  </v-bottom-navigation>
</template>

<script setup>
  import { useDisplay } from "vuetify";

  const { smAndUp } = useDisplay();
</script>
