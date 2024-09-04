<template>
  <v-layout class="overflow-hidden height-screen d-flex flex-column">
    <template v-if="smAndUp">
      <AppNavigation position="position-fixed top-0" />
      <main class="overflow-y-auto h-100 pa-4 pt-16">
        <slot />
      </main>
    </template>
    <template v-else>
      <main class="overflow-y-auto h-100 pa-4 pb-16">
        <slot />
      </main>
      <AppNavigation position="position-fixed bottom-0" />
    </template>
  </v-layout>
</template>

<script setup>
  import { useDisplay } from "vuetify";
  const { smAndUp } = useDisplay();
</script>
