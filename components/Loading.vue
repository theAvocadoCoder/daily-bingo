<template>
  <div class="flex justify-center items-center w-screen h-[calc(100dvh-100px)]">
    <div class="spinner"></div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.spinner {
  border: 5px solid rgba(0, 0, 0, 0.1);
  border-left-color: #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
