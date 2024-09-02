<template>
  <v-layout class="overflow-hidden height-screen d-flex flex-column">
    <template v-if="smAndUp">
      <AppNavigation />
      <slot class="overflow-y-auto h-100 pa-3" />
    </template>
    <template v-else>
      <slot class="overflow-y-auto h-100" />
      <AppNavigation />
    </template>
  </v-layout>
</template>

<script setup>
  import { useDisplay } from "vuetify";
  const { smAndUp } = useDisplay();
</script>
