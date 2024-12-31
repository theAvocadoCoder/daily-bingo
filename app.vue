
<template>
  <div>
    <NuxtLoadingIndicator />
    <NuxtLayout>
        <NuxtPage class="" />
    </NuxtLayout>
  </div>
</template>

<!-- Archived until group feature implementation is reinstated -->
<!-- <script setup lang="ts">
  import { useAblyStore } from "~/archived/stores/ablyStore";

  const { isSignedIn } = useAuth();
  const { getUser } = useRefreshUser();
  const ablyStore = useAblyStore();
  const { setStorageData, subscribeToUserGroups, disconnectAbly } = ablyStore;
  const { ably } = storeToRefs(ablyStore);

  onMounted(() => {
    if (isSignedIn.value) {
      getUser().then(() => {
        if (!ably.value) {
          setStorageData();
          subscribeToUserGroups();
        }
      })
    }
  })

  onUnmounted(() => {
    disconnectAbly();
  })
</script> -->
