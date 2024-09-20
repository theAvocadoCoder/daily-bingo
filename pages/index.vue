<template>
  <div class="bg-lime-50 h-full">
    <div class="flex flex-col justify-center items-center">
      <h1 class="text-3xl lg:text-5xl font-bold">Daily Bingo!</h1>
      <p class="italic text-sm">brought to you by <span class="font-medium [font-style:initial]">World of Avocado</span></p>
    </div>

    <div class="flex flex-col justify-center items-center py-5 md:py-7 lg:py-10 text-lg gap-7 md:gap-10 lg:gap-14">
      <p class="">Rediscover fun friend-group activities</p>
      <p class="">Create custom bingo cards</p>
      <div class="">
        <p class="">Don't know where to start?</p>
        <p class="">Try a <nuxt-link class="text-emerald-600 font-medium" to="/daily-card">random bingo card</nuxt-link></p>
      </div>
    </div>
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