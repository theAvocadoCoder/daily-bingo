<template>
  <v-card>
    <v-layout>
      <v-navigation-drawer
        expand-on-hover
        rail
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
          <v-list-item prepend-icon="mdi-account-group" title="Groups" value="groups"></v-list-item>
          <v-list-item prepend-icon="mdi-home" title="Home" value="home"></v-list-item>
          <v-list-item prepend-icon="mdi-star" title="Cards" value="cards"></v-list-item>
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
