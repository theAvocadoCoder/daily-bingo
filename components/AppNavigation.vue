<template>
  <v-bottom-navigation :elevation="0" mode="shift" class="position-fixed bottom-0">
    <nuxt-link to="/bingo">
      <v-btn value="bingo">
        <v-icon>mdi-account-group</v-icon>
        <span>Bingo</span>
      </v-btn>
    </nuxt-link>

    <nuxt-link to="/">
      <v-btn value="home">
        <v-icon>mdi-home</v-icon>
        <span>Home</span>
      </v-btn>
    </nuxt-link>

    <nuxt-link to="/canvas">
      <v-btn value="canvas">
        <v-icon>mdi-account-circle</v-icon>
        <span>Canvas</span>
      </v-btn>
    </nuxt-link>
  </v-bottom-navigation>
</template>
