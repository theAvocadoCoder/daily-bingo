<template>
  <div class="flex flex-col justify-center items-center">
    <SignIn />
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'guest' });
</script>
