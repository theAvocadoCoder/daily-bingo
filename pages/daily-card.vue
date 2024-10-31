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
  const { $storage, $toast } = useNuxtApp();
  
  let card = ref($storage.getData("dailyBingo"));
  let error = ref(null);

  onMounted(() => {
    // If card exists, check if it is up to or older than a day
    if (card.value) {
      const MS_IN_A_DAY = 8.64e7;
      if (
        new Date().setHours(0,0,0,0) // 12 AM today
        - new Date(card.value.created_at).setHours(0,0,0,0) // 12 AM when the card was created
        >= MS_IN_A_DAY
      ) {
        // TODO: Implement modal for loading new daily card
        $toast.info("New Bingo card available");
        setTimeout(generateDailyCard, 10000);
      }
    }

    if (!card.value) generateDailyCard();
  })

  async function generateDailyCard() {
    const results = await $fetch("/api/cards/daily");
    if (results) {
      card.value = {...results, saved: false};
      $storage.setData("dailyBingo", card.value);
    }
  }
</script>