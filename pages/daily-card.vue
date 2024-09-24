<template>
  <div class="bg-lime-50 h-full">
    <Loading v-if="cardStatus === 'pending'" />
    <Bingo v-else :card="card" type="dailyBingo" />
  </div>
</template>

<script setup lang="ts">
  const { getData, setData } = useNuxtApp().$locally; 
  const { data } = useAuth();

  let card = getData("dailyBingo");
  let user = data.value?.user;
  let cardStatus: string;

  if (!card) {
    const results = await useFetch("/api/cards/daily");
    card = toRaw(results.data.value);
    cardStatus = results.status as unknown as string;
  }

  setData("dailyBingo", card, false, [1, "d"]);
  setData("bingoUser", user, false, [14, "d"]);
</script>