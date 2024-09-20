<template>
  <div class="bg-lime-100 h-screen flex flex-col justify-center items-center">
  </div>
</template>

<script setup>
  const { signOut } = useAuth();

  onBeforeMount(async () => {
    await signOut({ callbackUrl: "/" });
  });
</script>