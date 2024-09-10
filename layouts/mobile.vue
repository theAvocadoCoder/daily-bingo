<template>
  <v-layout class="overflow-hidden height-screen d-flex flex-column">
      <v-main class="overflow-y-auto h-75 pa-4 pt-16">
        <slot />
      </v-main>
      <v-bottom-navigation
        v-model="value"
      >
        <nuxt-link to="/groups">
          <v-btn class="text-teal-darken-4" value="groups">
            <v-icon class="text-teal-darken-4">mdi-account-group</v-icon>
            <span>Groups</span>
          </v-btn>
        </nuxt-link>

        <nuxt-link to="/">
          <v-btn class="text-teal-darken-4" value="home">
            <v-icon class="text-teal-darken-4">mdi-home</v-icon>
            <span>Home</span>
          </v-btn>
        </nuxt-link>

        <nuxt-link to="/profile">
          <v-btn class="text-teal-darken-4" value="cards">
            <v-icon class="text-teal-darken-4">mdi-star</v-icon>
            <span>Cards</span>
          </v-btn>
        </nuxt-link>
      </v-bottom-navigation>
  </v-layout>
</template>

<script setup lang="ts">
  import { ref } from "vue";

  const value = ref(1);
</script>
