
<template>
  <div>
    <NuxtLoadingIndicator />
    <NuxtLayout>
        <NuxtPage class="" />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
  const { getUser } = useRefreshUser();

  onMounted(() => {
    getUser();
  })
</script>
