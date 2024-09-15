<template>
  <v-layout>
    <v-app class="w-full">
      <v-app-bar
        class="!bg-stone-950 !text-stone-50"
        prominent
      >
        <v-app-bar-nav-icon variant="text">
          <nuxt-link to="/" class="text-2xl">DB</nuxt-link>
        </v-app-bar-nav-icon>

        <v-spacer></v-spacer>

        <nuxt-link to="/profile">
          <v-btn icon="mdi-account" variant="text"></v-btn>
        </nuxt-link>
      </v-app-bar>

      <v-navigation-drawer
        permanent
        class="!bg-stone-800 !text-stone-50"
      >
        <v-list>
          <v-list-item
            prepend-avatar="https://upload.wikimedia.org/wikipedia/commons/b/be/Avocado_Coder.png"
            :subtitle="`@${user?.user?.username}`"
            :title="user?.user?.displayName"
          ></v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list density="compact" nav>
          <v-list-item
            v-for="(item) in navItems"
            :ref="setNavItem"
            tag="nuxt-link"
            :to="item.to"
            :active="item.to == path"
            :prepend-icon="item.icon"
            :value="item.value"
          >
            <v-list-item-title>{{ item.value.toLocaleUpperCase() }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-main class="overflow-y-auto h-75">
        <slot />
      </v-main>
    </v-app>
  </v-layout>
</template>

<script setup lang="ts">
  import type { VListItem } from "vuetify/components";
  import { useUserStore } from "../stores/user";
  import { navItems } from "./_data.json";

  const path = ref(useRoute().path)

  // Watch for changes in the route
  watch(
    () => useRoute().path,
    (newPath) => {
      path.value = newPath;  // Update currentPath whenever the route changes
    }
  );

  const user = useUserStore();
  const navRefs = ref<VListItem[]>([]);
  function setNavItem(el: VListItem) {
    if (el) navRefs.value.push(el);
    return navRefs;
  }
  

</script>
