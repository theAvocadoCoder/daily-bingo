<template>
  <div class="h-full bg-lime-50 relative">
    <v-btn class="" icon="mdi-arrow-left" variant="text" @click="$router.back()"></v-btn>
    <h1 class="sr-only">Create a New Card</h1>
    <v-text-field
      class=""
      v-model="newCard.card_name"
      label="Card Name"
      :rules="cardNameRules"
    >
    </v-text-field>
      <v-combobox
        class=""
        chips
        hint="Tap Enter to add more entries"
        v-model="newCard.cells"
        label="Card Entries"
        multiple
        :rules="entryRules"
      ></v-combobox>
     <ConfirmDialog
        dialog-button-text="Create"
        dialog-title="Create New Card?"
        :dialog-text="`A new bingo card will be created with your provided entries. ${newCard.cells.length === 24 ?
          '' : 24 - newCard.cells.length + (newCard.cells.length === 23 ? ' entry ' : ' entries ') + 'will be filled with randomly generated text'}`"
        :action-buttons="[
          {
            buttonText: 'Cancel',
          },
          {
            buttonText: 'Create Bingo Card',
            onClick: handleSave
          }, 
        ]"
      />
  </div>
</template>

<script setup lang="ts">
  const { setData } = useNuxtApp().$locally;
  const { data, getSession } = useAuth();
  const sessionUser = computed(() => data.value?.user);
  const router = useRouter();
  const { $toast } = useNuxtApp();
  const newCard = ref({
    card_name: "",
    cells: []
  });

  const entryRules = [
    // Check that each entry entry is not more than 32 characters
    value => {
      return !value.find(entry => entry.length > 32)
      || 'An entry must contain no more than 32 characters'
    },
    // Check that each word is not more than 9 characters
    value => {
      return !value.find(entry => {
        return entry.split(/\.|\s|,\s|;\s|:\s/g).find(word => word.length > 9)
      })
      || 'Each word must be less than 10 characters. You can break your words with a dash (-)'
    }
  ];
  const cardNameRules = [
    value => !!value || 'You have to call it something'
  ];

  async function handleSave() {
    await $fetch("/api/cards/new", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...newCard.value,
        user: sessionUser.value
      })
    }).then(async (savedCard) => {
      await $fetch(`/api/users/${sessionUser.value._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            cards: {
              created_by: savedCard.creator,
              _id: savedCard._id,
              card_name: savedCard.name,
            },
          }
        }),
      });
    });
    await getSession(true);
    setData("bingoUser", sessionUser.value, true);

    router.push(`/cards?s=${newCard.value.card_name}`);
    $toast.success(`${newCard.value.card_name} created`);
  }
</script>