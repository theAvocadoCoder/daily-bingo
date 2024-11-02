
<template>
  <div>
    <NuxtLoadingIndicator />
    <NuxtLayout>
        <NuxtPage class="" />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
  onMounted(() => {
    useNuxtApp().$storage
    .setData("bingoUser", 
      useAuth().data.value?.user
    )
  })
</script>
