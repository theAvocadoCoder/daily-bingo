<template>
  <div class="bg-lime-100 h-screen flex flex-col justify-center items-center">
  </div>
</template>

<script setup>
  const { signIn } = useAuth();

  onMounted(async () => {
    await signIn("auth0", { callbackUrl: "/" }, { screen_hint: "signup" });
  });
</script>