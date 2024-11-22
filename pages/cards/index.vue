<template>
  <div class="h-fit relative" v-if="!isLoaded">
    <Loading />
  </div>
  <div class="h-fit relative flex justify-center" v-else-if="!isSignedIn">
    <v-btn tag="nuxt-link" to="sign/in">Sign in to view this page</v-btn>
  </div>
  <div class="h-fit relative" v-else>
    <v-btn tag="nuxt-link" to="/cards/new"
      :class="`!fixed bottom-20 right-5 z-20 p-5 !bg-lime-700 hover:!bg-lime-900 !text-lime-50`"
      icon="mdi-plus"></v-btn>
    <h1 class="sr-only">Your Cards</h1>

    <v-text-field v-model="searchValue" rounded color="zinc-200/80" variant="outlined" label="Search cards"
      aria-role="search" @focusout="handleSearchFocusOut">
      <template v-slot:append-inner>
        <v-btn variant="text" @click="searchValue !== null ? (searchValue = null) : ''"
          :icon="searchValue === null ? 'mdi-magnify' : 'mdi-close'"></v-btn>
      </template>
    </v-text-field>

    <ul class="flex flex-col gap-2">
      <Loading v-if="!displayedCards" />
      <li v-else-if="displayedCards?.length == 0" class="text-zinc-600 [&_a]:text-lime-600 [&_a]:font-bold text-center">
        <template v-if="searchValue !== null">
          <span>You have no cards that match this search.</span>
          <span>Try <nuxt-link to="/cards/new">creating one</nuxt-link></span>
        </template>
        <template v-else>
          <span>You haven't saved any cards yet.</span>
          <span>Try saving
            <nuxt-link to="/">your daily bingo card</nuxt-link></span>
        </template>
      </li>
      <li v-else v-for="card in displayedCards">
        <ListCard :card="card" :displayedCards="displayedCards" @update-cards="handleUpdateCards" />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type User from "~/interfaces/User";
import type Card from "~/interfaces/Card";
const { $lstorage } = useNuxtApp();
const { getUser } = useRefreshUser();
const route = useRoute();
const { isLoaded, isSignedIn } = useAuth();

const sessionUser = computed(() => $lstorage.getData("bingoUser") as User);

const searchValue = ref<null | string>(
  route?.query?.s ? (route.query.s as string) : null
);

const userCards = ref<Card[]>();

userCards.value = await $fetch<Card[]>("/api/cards", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    cards: sessionUser.value?.cards,
  }),
});

const displayedCards = computed(() => {
  const cards = Array.isArray(userCards.value) ? userCards.value : [];
  if (searchValue.value === null) {
    return cards;
  } else {
    return cards?.filter((card) =>
      card.name
        .toLocaleLowerCase()
        .includes((searchValue.value as string).toLocaleLowerCase())
    );
  }
});

function handleSearchFocusOut() {
  // If the search value is empty, set it to null
  if (
    searchValue.value &&
    (searchValue.value === "" || searchValue.value.trim().length < 1)
  ) {
    searchValue.value = null;
  }
}

async function handleUpdateCards() {
  await getUser();
  userCards.value = await $fetch<Card[]>("/api/cards", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      Expires: "0",
    },
    body: JSON.stringify({
      cards: sessionUser.value.cards,
    }),
  });
}
</script>
