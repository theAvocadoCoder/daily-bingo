<template>
  <v-layout>
    <v-app-bar
      class="!bg-stone-950 !text-stone-50 !px-5 !w-full"
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
      v-if="$vuetify.display.lgAndUp"
      permanent
      class="!bg-stone-800 !text-stone-50"
    >
      <v-list>
        <v-list-item
          tag="nuxt-link"
          to="/profile"
          prepend-avatar="https://upload.wikimedia.org/wikipedia/commons/b/be/Avocado_Coder.png"
          :subtitle="`@${user?.username}`"
          :title="user?.displayName"
        ></v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item
          v-for="(item) in navItems"
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

    <v-main class="h-full">
      <slot />
    </v-main>

    <v-bottom-navigation
      v-if="!$vuetify.display.lgAndUp"
      mode="shift"
      class="!bg-stone-950 fixed bottom-0 !w-full"
    >
      <v-btn 
        v-for="(item) in navItems"
        tag="nuxt-link"
        :to="item.to"
        class="!text-stone-50" 
        :value="item.value"
      >
        <v-icon>{{ item.icon }}</v-icon>
        <span>{{ item.value.toLocaleUpperCase() }}</span>
      </v-btn>
    </v-bottom-navigation>
  </v-layout>
</template>

<script setup lang="ts">
  import { navItems } from "./_data.json";
  const { getData } = useNuxtApp().$locally; 

  const path = computed(() => useRoute().path);
  const user = ref();

  onMounted(() => {
    user.value = getData("bingoUser")
  })
</script>
