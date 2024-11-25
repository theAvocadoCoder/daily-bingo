
<template>
  <div>
    <NuxtLoadingIndicator />
    <NuxtLayout>
        <NuxtPage class="" />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
  import { useAblyStore } from "~/stores/ablyStore.ts";

  const { isSignedIn } = useSession();
  const { getUser } = useRefreshUser();
  const ablyStore = useAblyStore();
  const { setStorageData, subscribeToUserGroups, disconnectAbly } = ablyStore;

  onMounted(() => {
    getUser();
    if (isSignedIn) {
      setStorageData();
      subscribeToUserGroups();
    }
  })

  onUnmounted(() => {
    disconnectAbly();
  })
</script>
