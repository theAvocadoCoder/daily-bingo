<template>
  <div class="h-full bg-lime-50 relative">
    <v-btn class="" icon="mdi-arrow-left" variant="text" @click="$router.back()"></v-btn>
    <h1 class="sr-only">Create a New Card</h1>
    <v-text-field
      class=""
      v-model="newCard.name"
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
  import type Card from '~/interfaces/Card';
  import type User from '~/interfaces/User';

  const { setData } = useNuxtApp().$locally;
  const { data, getSession } = useAuth();
  const sessionUser = computed(() => data.value?.user as User);
  const router = useRouter();
  const { $toast } = useNuxtApp();
  const newCard = ref({
    name: "",
    cells: []
  });

  const entryRules = [
    // Check that each entry entry is not more than 32 characters
    (value: string[]) => {
      return !value.find(entry => entry.length > 32)
      || 'An entry must contain no more than 32 characters'
    },
    // Check that each word is not more than 9 characters
    (value: string[]) => {
      return !value.find(entry => {
        return entry.split(/\.|\s|,\s|;\s|:\s/g).find(word => word.length > 9)
      })
      || 'Each word must be less than 10 characters. You can break your words with a dash (-)'
    }
  ];
  const cardNameRules = [
    (value: string) => !!value || 'You have to call it something'
  ];

  async function handleSave() {
    await $fetch<Card>("/api/cards/new", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...newCard.value,
        creator: {
          user_id: sessionUser.value?._id,
          username: sessionUser.value?.username,
        },
      })
    }).then(async (savedCard) => {
      if (savedCard) {
        await $fetch(`/api/users/${sessionUser.value?._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: savedCard._id,
            operation: "cards-insert",
          }),
        });
      }
    });
    // @ts-expect-error
    await getSession(true);
    setData("bingoUser", sessionUser.value, true);

    router.push(`/cards?s=${newCard.value.name}`);
    $toast.success(`${newCard.value.name} created`);
  }
</script>