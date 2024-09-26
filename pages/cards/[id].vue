<template>
  <div class="flex flex-col gap-3 justify-center items-center">
    <h1 class="self-start text-lg lg:text-xl">
      {{cardName}}
    </h1>

    <Loading v-if="cardStatus === 'pending'" />
    <Bingo v-else :card="card" type="currentCard" saved />
  </div>
</template>

<script setup lang="ts">
  const { getData, setData } = useNuxtApp().$locally;
  const {data} = useAuth();
  const route = useRoute();

  const card = ref(getData("currentCard"));
  const cardStatus: string = ref(card ? "" : "pending");

  const { id: cardId } = route.params;

  const sessionUser = computed(() => data.value?.user);
  const cardName = sessionUser.value.cards.find(card => card._id == cardId).card_name;

  if (!card.value) {
    const results = await useFetch(`/api/cards/${cardId}`);
    card.value = toRaw(results.data.value);
    cardStatus.value = results.status as unknown as string;
    setData("currentCard", card.value, false);
  }

  onUnmounted(() => {
    setData("currentCard", null, false);
  });
  
</script>