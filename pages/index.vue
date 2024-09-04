<template>
  <div>
    <h1 class="">Daily Bingo!</h1>
    <p>{{ user?.greeting }}, {{ user?.username }}</p>

    <Bingo :card="card?.cells" />
  </div>
</template>

<script setup lang="ts">
  const userId = "66d8754397e9d9f8ccb56203";

  const { data: user } = await useFetch(`/api/users/${userId}`);
  const userCards = user.value?.cards.created;
  const { data: card } = (userCards && userCards.length) ?
    await useFetch(`/api/cards/${userCards[0]}`) : {data: null};

</script>