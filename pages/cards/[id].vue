<template>
  <div class="flex flex-col gap-3 justify-center items-center relative" v-if="!isLoaded">
    <Loading />
  </div>
  <div class="flex flex-col gap-3 justify-center items-center relative" v-else-if="!isSignedIn">
    <v-btn tag="nuxt-link" to="/sign-in">Sign in to view this page</v-btn>
  </div>
  <div class="flex flex-col gap-3 justify-center items-center relative" v-else>
    <v-btn tag="nuxt-link" to="/cards/new" :class="`!fixed bottom-20 right-5 z-20 p-5 !bg-lime-700 hover:!bg-lime-900 !text-lime-50`" icon="mdi-plus"></v-btn>
    <div class="flex flex-col sm:flex-row sm:items-center w-full md:gap-10">
      <v-btn class="" icon="mdi-arrow-left" variant="text" @click="$router.back()"></v-btn>
      <h1 class="text-lg lg:text-xl grow text-center md:text-left">
        {{cardName || ""}}
      </h1>
    </div>
    <!-- TODO: Implement proper error message -->
    <div v-if="error">Error Message</div>
    <Bingo v-else-if="card" type="currentCard" />
    <Loading v-else />
  </div>
</template>

<script setup lang="ts">
  const { $lstorage } = useNuxtApp();
  const route = useRoute();
  const { isLoaded, isSignedIn } = useAuth();

  let card = ref($lstorage.getData("currentCard"));
  let error = ref(null);

  const cardId = route.params.id as unknown;

  let cardName: ComputedRef;

  onMounted(async () => {
    if (!card.value) {
      const results = await $fetch(`/api/cards/${cardId}`);
      if (results) {
        card.value = results;
        $lstorage.setData("currentCard", {...card.value, saved: true});
        cardName = computed(() => card.value.name)
      }
    }
  })

  onUnmounted(() => {
    $lstorage.setData("currentCard", null);
  });
  
</script>