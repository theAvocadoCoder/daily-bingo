<template>
  <div class="h-fit flex justify-center items-center relative">
    <v-btn tag="nuxt-link" to="/cards/new" :class="`!fixed bottom-20 right-5 z-20 p-5 !bg-lime-700 hover:!bg-lime-900 !text-lime-50`" icon="mdi-plus"></v-btn>
    <!-- TODO: Implement proper error message -->
    <div v-if="error">Error message</div>
    <Bingo v-else-if="card" type="dailyBingo" />
    <Loading v-else />
  </div>
</template>

<script setup lang="ts">
  definePageMeta({ middleware: "guest" })
  const { $lstorage, $toast } = useNuxtApp();
  const { userId } = useAuth();
  const { isSignedIn } = useSession();
  
  const card = ref();
  const error = ref(null);
  const newToastInstance = ref();

  onMounted(() => {
    card.value = $lstorage.getData("dailyBingo");
    // If card exists, check if it is up to or older than a day
    if (card.value) {
      const MS_IN_A_DAY = 8.64e7;
      if (
        new Date().setHours(0,0,0,0) // 12 AM today
        - new Date(card.value.created_at).setHours(0,0,0,0) // 12 AM when the card was created
        >= MS_IN_A_DAY
        && isSignedIn.value
      ) {
        newToastInstance.value = $toast.info("New Daily Bingo card! Click to update", {
          duration: 0,
          onClick: generateDailyCard,
        });
      }
    }

    if (!card.value) generateDailyCard();
  })

  onMounted(() => {
    const sessionUser = $lstorage.getData("bingoUser");
    if (!sessionUser) $lstorage.setData("bingoUser", { _id: userId.value });
  })

  onUnmounted(() => {
    if (newToastInstance.value) newToastInstance.value.dismiss();
  })

  async function generateDailyCard() {
    const results = await $fetch("/api/cards/daily");
    if (results) {
      card.value = {...results, saved: false};
      $lstorage.setData("dailyBingo", card.value);
    }
  }
</script>