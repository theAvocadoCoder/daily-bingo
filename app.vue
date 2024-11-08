
<template>
  <div>
    <NuxtLoadingIndicator />
    <NuxtLayout>
        <NuxtPage class="" />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
  const { $storage } = useNuxtApp();
  const { data } = useAuth();

  onMounted(() => {
    if (data.value?.user && $storage.getData("bingoUser") !== data.value?.user)
      $storage.setData("bingoUser", data.value?.user)
  })
</script>
