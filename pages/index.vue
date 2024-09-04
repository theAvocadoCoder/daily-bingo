<template>
  <div>
    <h1>Daily Bingo!</h1>
    <p>Welcome back, {{ user?.username }}</p>
  </div>
</template>

<script setup lang="ts">
  const { data: user } = await useFetch("/api/user");
</script>