<template>
  <div class="flex flex-col justify-center items-center">
    <SignUp />
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'guest' });
const { getUser } = useRefreshUser();
onBeforeUnmount(() => getUser())
</script>
