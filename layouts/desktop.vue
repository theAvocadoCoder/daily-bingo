<template>
  <v-card>
    <v-layout>
      <v-app-bar
        color="primary"
        prominent
      >
        <v-app-bar-nav-icon variant="text">
          <nuxt-link to="/">DB</nuxt-link>
        </v-app-bar-nav-icon>

        <v-spacer></v-spacer>

        <v-btn icon="mdi-account" variant="text"></v-btn>
      </v-app-bar>

      <v-navigation-drawer
        permanent
      >
        <v-list>
          <v-list-item
            prepend-avatar=""
            :subtitle="`@${user?.user?.username}`"
            :title="user?.user?.displayName"
          ></v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list density="compact" nav>
          <v-list-item tag="nuxt-link" :to="'/groups'" prepend-icon="mdi-account-group" value="groups" :class="`hover:bg-green-900/10`">
            <v-list-item-title>Groups</v-list-item-title>
          </v-list-item>
          <v-list-item tag="nuxt-link" :to="'/'" prepend-icon="mdi-home" value="home" class="hover:bg-green-900/10">
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item>
          <v-list-item tag="nuxt-link" :to="'/profile'" prepend-icon="mdi-star" value="cards" class="hover:bg-green-900/10">
            <v-list-item-title>Cards</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-main class="overflow-y-auto h-75">
        <slot />
      </v-main>
    </v-layout>
  </v-card>
</template>

<script setup lang="ts">
  import { useUserStore } from "../stores/user";

  const user = useUserStore();

</script>
