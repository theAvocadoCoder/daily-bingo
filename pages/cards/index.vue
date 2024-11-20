<template>
  <div class="h-fit relative">
    <v-btn tag="nuxt-link" to="/cards/new" :class="`!fixed bottom-20 right-5 z-20 p-5 !bg-lime-700 hover:!bg-lime-900 !text-lime-50`" icon="mdi-plus"></v-btn>
    <h1 class="sr-only">
      Your Cards
    </h1>

    <v-text-field
      v-model="searchValue"
      rounded
      color="zinc-200/80"
      variant="outlined"
      label="Search cards"
      aria-role="search"
      @focusout="handleSearchFocusOut"
    >
      <template v-slot:append-inner>
        <v-btn
          variant="text"
          @click="searchValue !== null ? searchValue = null : ''"
          :icon="searchValue === null ? 'mdi-magnify' : 'mdi-close'"
        ></v-btn>
      </template>
    </v-text-field>

    <ul class="flex flex-col gap-2">
      <li v-for="(card, index) in displayedCards">
        <v-card
          class="!bg-lime-100 hover:!bg-lime-200/80"
          :tag="editMode == card._id ? 'div' : 'nuxt-link'"
          @click.prevent="editMode == card._id"
          :to="`/cards/${card._id}`"
        >
          <v-card-text class="flex justify-between items-center !py-3 !px-2">
            <div>
              <v-form v-if="editMode === card._id" @submit.prevent="handleSaveEdit(card._id)" @click.prevent class="flex items-center w-fit px-4">
                <v-text-field
                  class="min-w-32 m-0"
                  v-model="cardModel.card_name"
                  :placeholder="card.name"
                  label="Card Name"
                  variant="underlined"
                ></v-text-field>
                <v-btn icon="mdi-close" variant="text" :disabled="saving" @click.prevent="handleCancelEdit"></v-btn>
                <v-btn type="submit" :loading="saving" @click.prevent="handleSaveEdit(card._id)">Save</v-btn>
              </v-form>
              <v-card-title v-else class="!text-lg truncate max-w-32 min-[330px]:max-w-40 min-[425px]:max-w-64 sm:max-w-72 md:max-w-96">{{ card.name }}</v-card-title>
              <v-card-subtitle>by {{ `${ card.creator.user_id ? '@' : '' }${ card.creator.username }` }}</v-card-subtitle>
            </div>
            <div>
              <v-btn v-if="card.creator?.user_id === sessionUser._id || card.creator?.username === 'Daily Bingo'" :icon="editMode == card._id ? 'mdi-check' : 'mdi-pencil'" :disabled="!!editMode && editMode != card._id" variant="text" @click.prevent="handleSaveEdit(card._id)"></v-btn>
              <v-btn icon="mdi-delete" :disabled="!!editMode && editMode != card._id" variant="text" @click.prevent="cancelDialog = true; selectedCardId = card._id"></v-btn>
              <v-dialog v-model="cancelDialog" width="auto">
                <v-card
                  :max-width="400"
                >
                  <v-card-title>Delete Bingo Card?</v-card-title>
                  <v-card-text>
                    <p>
                      This will permanently delete this card from your collection. The card will still be available on groups it has been shared to, and in the collections of users who have saved it.
                    </p>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                      class="mb-auto hover:!bg-gray-900/20 !bg-gray-300/50"
                      @click="cancelDialog = false; selectedCardId = ''"
                    >
                      Cancel
                    </v-btn>
                    <v-btn
                      class="mb-auto hover:!bg-red-600 !bg-red-700 !font-bold text-white"
                      @click="handleDelete()"
                    >
                      Delete Card
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </div>
          </v-card-text>
        </v-card>
      </li>
      <template v-if="!displayedCards">
        <Loading />
      </template>
      <template v-if="displayedCards?.length == 0">
        <li class="text-zinc-600 [&_a]:text-lime-600 [&_a]:font-bold text-center">
          <template v-if="searchValue !== null">
            <span>You have no cards that match this search.</span>
            <span>Try <nuxt-link to="/cards/new">creating one</nuxt-link></span>
          </template>
          <template v-else>
            <span>You haven't saved any cards yet.</span> 
            <span>Try saving <nuxt-link to="/">your daily bingo card</nuxt-link></span>
          </template>
        </li> 
      </template>
    </ul>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: "auth",
  auth: {
    guestRedirectUrl: "/sign-in"
  }
});

  import type User from "~/interfaces/User";
  import type Card from "~/interfaces/Card";
  const { $storage, $toast } = useNuxtApp();
  const { data, getSession } = useAuth();
  const route = useRoute();

  const sessionUser = computed(() => data.value?.user as User);
  const cardModel = ref({
    card_name: ""
  });

  const searchValue = ref<null | string>(route?.query?.s ? (route.query.s as string) : null);
  const cancelDialog = ref(false);
  const selectedCardId = ref();
  const editMode = ref<unknown | boolean>(false);
  const saving = ref(false);

  const userCards = ref<Card[]>();

  userCards.value = await $fetch<Card[]>("/api/cards", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      cards: sessionUser.value?.cards
    }),
  });

  const displayedCards = computed(() => {
    const cards = Array.isArray(userCards.value) ? userCards.value : [];
    if (searchValue.value === null) {
      return cards;
    } else {
      return cards?.filter(card => (
        card.name.toLocaleLowerCase().includes((searchValue.value as string).toLocaleLowerCase())
      ));
    }
  });

  function handleSearchFocusOut() {
    // If the search value is empty, set it to null
    if (searchValue.value && (searchValue.value === "" || searchValue.value.trim().length < 1)) {
      searchValue.value = null
    }
  }

  function handleCancelEdit() {
    cardModel.value.card_name = "";
    editMode.value = false;
  }

  async function handleSaveEdit(cardId?: unknown) {
    const theCard = displayedCards.value?.find(card => card._id == cardId);

    if (editMode.value == cardId) {
      saving.value = true;

      if (cardModel.value && cardModel.value.card_name == "") {
        const previousCardName = theCard?.name || "";
        cardModel.value.card_name = previousCardName;
      }

      if (theCard?.creator?.user_id === sessionUser.value._id || (theCard?.creator.username === "Daily Bingo" && !theCard?.creator.user_id)) {
        await $fetch(`/api/cards/${theCard?._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            card: {
              name: cardModel.value.card_name,
            },
          }),
        });

        await getSession(true);

        userCards.value = await $fetch<Card[]>("/api/cards", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
            "Expires": "0",
          },
          body: JSON.stringify({
            cards: sessionUser.value?.cards,
          }),
        });
      }
      // $storage.setData("bingoUser", sessionUser.value);
      cardModel.value.card_name = "";
      saving.value = false;
      editMode.value = false;
    } else {
      editMode.value = cardId || false;
    }
  }

  async function handleDelete() {
    saving.value = true;
    cancelDialog.value = false;

    const theCard = displayedCards.value?.find(card => card._id == selectedCardId.value) as Card;

    let deleteObject = null;

    if (theCard?.creator?.user_id === sessionUser.value._id) {
      deleteObject = {
        card: { isDeleted: true },
      };
    }

    await $fetch(`/api/cards/${theCard?._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        operation: -1,
        ...deleteObject,
      }),
    }).then(async () => {
      return await $fetch<User>(`/api/users/${sessionUser.value._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: theCard._id,
          operation: "cards-delete"
        }),
      });
    }).then(async (theUser) => {
      userCards.value = await $fetch<Card[]>("/api/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
          "Expires": "0",
        },
        body: JSON.stringify({
          cards: theUser?.cards,
        }),
      });

      // @ts-expect-error
      await getSession(true);
      $storage.setData("bingoUser", sessionUser.value);
      $toast.success("Card deleted");
      saving.value = false;
      selectedCardId.value = '';
    });
  }
</script>