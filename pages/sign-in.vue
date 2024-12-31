<template>
  <div class="flex flex-col justify-center items-center">
    <SignIn />
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'guest' });
const { getUser } = useRefreshUser();
const { isSignedIn } = useAuth();
onBeforeUnmount(() => getUser())

watch(isSignedIn, (value) => {
  if (value) {
    console.log("watch ran")
    const redirectUrl = $sStorage.getData("signInRedirect");
    $sStorage.setData("signInRedirect", null);
    $router.push(redirectUrl || "/");
  }
})
</script>
