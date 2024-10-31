<template>
  <div class="flex flex-col gap-3 justify-center items-center relative">
    <v-btn tag="nuxt-link" to="/cards/new" :class="`!fixed bottom-20 right-5 z-20 p-5 !bg-lime-700 hover:!bg-lime-900 !text-lime-50`" icon="mdi-plus"></v-btn>
    <div class="flex flex-col sm:flex-row sm:items-center w-full md:gap-10">
      <v-btn class="" icon="mdi-arrow-left" variant="text" @click="$router.back()"></v-btn>
      <h1 class="text-lg lg:text-xl grow text-center md:text-left">
        {{cardName}}
      </h1>
    </div>
    <Loading v-if="cardStatus === 'pending'" />
    <Bingo v-else type="currentCard" saved />
  </div>
</template>

<script setup lang="ts">
  const { $storage } = useNuxtApp();
  const route = useRoute();

  const card = ref($storage.getData("currentCard"));
  const cardStatus = ref<string>(card.value ? "" : "pending");

  const cardId = route.params.id as unknown;

  const cardName = computed(() => card.value.name);

  if (!card.value) {
    const results = await useFetch(`/api/cards/${cardId}`);
    if (results) {
      card.value = toRaw(results.data.value)
      $storage.setData("currentCard", {...card.value, saved: true});
    }
  }

  onUnmounted(() => {
    $storage.setData("currentCard", null);
  });
  
</script>