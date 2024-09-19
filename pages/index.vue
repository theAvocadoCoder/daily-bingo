<template>
  <div class="bg-lime-50 h-full">
    <h2>Daily Bingo!</h2>
    <p>It's an amazing adventure awaiting you!</p>
  </div>
</template>

<script setup lang="ts">
  definePageMeta({
    auth: {
      unauthenticatedOnly: true,
      navigateAuthenticatedTo: '/daily-card'
    }
  })
</script>