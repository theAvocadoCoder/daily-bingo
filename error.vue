<template>
  <div class="mt-7 max-w-sm mx-auto text-center">
    <p class="mt7">{{ error.statusCode }}</p>
    <p class="mt-7">Oops.</p>
    <p class="mt-7">{{ error.message }}</p>
    <button class="mt-7" @click="handleClearError">Go Home...</button>
    
  </div>
</template>

<script setup>
  defineProps(["error"]);

  const handleClearError = () => clearError({ redirect: "/"});
</script>
