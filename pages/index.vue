<template>
  <DailyCard v-if="isSignedIn" />
  <LandingPage v-else-if="isLoaded" />
  <Loading v-else />
</template>

<script setup lang="ts">
  const { isSignedIn, isLoaded } = useSession();
</script>