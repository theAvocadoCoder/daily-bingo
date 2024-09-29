<template>
  <div class="bg-lime-50 h-full flex justify-center items-center relative">
    <v-btn tag="nuxt-link" to="/cards/new" :class="`!fixed bottom-20 right-5 z-20 p-5 !bg-lime-700 hover:!bg-lime-900 !text-lime-50`" icon="mdi-plus"></v-btn>
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
    card = {cells: toRaw(results.data.value), saved: false};
    cardStatus = results.status as unknown as string;
    setData("dailyBingo", card, false, [1, "d"]);
  }
  setData("bingoUser", user, false, [14, "d"]);
</script>