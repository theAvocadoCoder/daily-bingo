
<template>
  <div>
    <NuxtLoadingIndicator />
    <NuxtLayout>
        <NuxtPage class="" />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
  import { useAblyStore } from "~/stores/ablyStore";

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
</script>
