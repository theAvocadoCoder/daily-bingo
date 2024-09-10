
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
  import { onMounted, ref } from "vue";

  const layout = ref("mobile");
  const { lgAndUp } = useDisplay();

  onMounted(() => {
    if (lgAndUp.value) layout.value = "desktop";
  })
</script>
