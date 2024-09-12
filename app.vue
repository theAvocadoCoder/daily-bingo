
<template>
  <div>
    <NuxtLayout :name="layout">
      <v-app>
      <NuxtPage />
    </v-app>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
  import { useDisplay } from "vuetify";

  const { lgAndUp } = useDisplay();
  const layout = lgAndUp.value ? "desktop" : "mobile";
</script>
