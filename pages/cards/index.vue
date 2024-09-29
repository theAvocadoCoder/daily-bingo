<template>
  <div class="h-full bg-lime-50 relative">
    <v-btn tag="nuxt-link" to="/cards/new" :class="`!fixed bottom-20 right-5 z-20 p-5 !bg-lime-700 hover:!bg-lime-900 !text-lime-50`" icon="mdi-plus"></v-btn>
    <h1>
      Your Cards
    </h1>

    <ul class="flex flex-col gap-2">
      <li v-for="(card, index) in sessionUser.cards">
        <v-card
          class="!bg-lime-300 hover:!bg-lime-500/80"
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
                  :placeholder="card.card_name"
                  label="Card Name"
                  variant="underlined"
                ></v-text-field>
                <v-btn icon="mdi-close" variant="text" :disabled="saving" @click.prevent="handleCancelEdit"></v-btn>
                <v-btn type="submit" :loading="saving" @click.prevent="handleSaveEdit(card._id)">Save</v-btn>
              </v-form>
              <v-card-title v-else class="!text-lg truncate max-w-32 min-[330px]:max-w-40 min-[425px]:max-w-64 sm:max-w-72 md:max-w-96">{{ card.card_name }}</v-card-title>
              <v-card-subtitle>by {{ `${ card.created_by.user_id ? '@' : '' }${ card.created_by.username }` }}</v-card-subtitle>
            </div>
            <div>
              <v-btn :icon="editMode == card._id ? 'mdi-check' : 'mdi-pencil'" :disabled="editMode && editMode != card._id" variant="text" @click.prevent="handleSaveEdit(card._id)"></v-btn>
              <v-btn icon="mdi-delete" :disabled="editMode && editMode != card._id" variant="text" @click.prevent="cancelDialog = true; selectedCardId = card._id"></v-btn>
              <v-dialog v-model="cancelDialog" width="auto">
                <v-card
                  :max-width="400"
                >
                  <v-card-title>Delete Bingo Card?</v-card-title>
                  <v-card-text>
                    <p>
                      This will permanently delete this card from your collection. If it is a group card, it will still be available on the group.
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
                      class="mb-auto hover:!bg-lime-900 !bg-lime-700 text-white"
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
    </ul>
  </div>
</template>

<script setup lang="ts">
  const { setData } = useNuxtApp().$locally;
  const { $toast } = useNuxtApp();
  const { data, getSession } = useAuth();

  const sessionUser = computed(() => data.value?.user);
  const cardModel = ref({
    card_name: ""
  })

  const cancelDialog = ref(false);
  const selectedCardId = ref();
  const editMode = ref(false);
  const saving = ref(false);

  function handleCancelEdit() {
    cardModel.value.card_name = "";
    editMode.value = false;
  }

  async function handleSaveEdit(cardId?) {
    if (editMode.value == cardId) {
      saving.value = true;

      if (cardModel.value.card_name == "") {
        const previousCardName = sessionUser.value.cards.find(card => card._id == cardId).card_name;
        cardModel.value.card_name = previousCardName;
      }

      await $fetch(`/api/users/${sessionUser.value._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            "cards.$.card_name": cardModel.value.card_name,
          },
          filters: {
            "cards._id": cardId,
          }
        }),
      });

      await getSession(true);
      setData("bingoUser", sessionUser.value, true);
      saving.value = false;
      editMode.value = false;
    } else {
      editMode.value = cardId;
    }
  }

  async function handleDelete() {
    saving.value = true;
    cancelDialog.value = false;

    await $fetch(`/api/users/${sessionUser.value._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          "cards": sessionUser.value.cards.find(card => card._id == selectedCardId.value),
        }
      }),
    });

    await getSession(true);
    setData("bingoUser", sessionUser.value, true);
    $toast.success("Card deleted");
    saving.value = false;
    selectedCardId.value = '';
  }
</script>