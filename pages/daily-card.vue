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
  let user = getData("bingoUser");
  let cardStatus;
  let userStatus;

  if (!card) {
    const results = await useFetch("/api/cards/daily");
    card = toRaw(results.data._value);
    cardStatus = results.status;
  }
  if (!user) {
    const results = await useFetch("/api/users/66d8754397e9d9f8ccb56203");
    user = toRaw(results.data._value);
    userStatus = results.status;
  }
  
  setData("dailyBingo", card, false, [1, "d"]);
  setData("bingoUser", user, false, [1, "d"]);
</script>