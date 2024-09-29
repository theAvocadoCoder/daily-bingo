<template>
  <div class="flex flex-col gap-3 justify-center items-center bg-lime-50 relative">
    <v-btn tag="nuxt-link" to="/cards/new" :class="`!fixed bottom-20 right-5 z-20 p-5 !bg-lime-700 hover:!bg-lime-900 !text-lime-50`" icon="mdi-plus"></v-btn>
    <div class="flex flex-col sm:flex-row sm:items-center w-full md:gap-10">
      <v-btn class="" icon="mdi-arrow-left" variant="text" @click="$router.back()"></v-btn>
      <h1 class="text-lg lg:text-xl grow text-center md:text-left">
        {{cardName}}
      </h1>
    </div>
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