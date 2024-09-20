<template>
  <NuxtLayout>
    <div class="h-[calc(100dvh-3rem)] bg-lime-200 flex flex-col items-center justify-center gap-3 lg:gap-7">
      <p class="font-bold text-3xl lg:text-5xl">{{ error.statusCode }}</p>
      <p class="font-medium text-xl lg:text-3xl">Well, this is awkward...</p>
      <p class="italic">{{ error.message }}</p>
      <v-btn @click="handleClearError">Let's get you back home</v-btn>
      
    </div>
  </NuxtLayout>
</template>

<script setup>
  defineProps(["error"]);

  const handleClearError = () => clearError({ redirect: "/"});
</script>
