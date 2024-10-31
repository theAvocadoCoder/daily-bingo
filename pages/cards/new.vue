<template>
  <div class="h-fit relative">
    <v-btn class="" icon="mdi-arrow-left" variant="text" @click="$router.back()"></v-btn>
    <h1 class="sr-only">Create a New Card</h1>
    <v-text-field
      class=""
      v-model="newCard.name"
      label="Card Name"
      :rules="cardNameRules"
    />
    <v-text-field
      class=""
      label="Card Entries"
      v-model="currentEntry"
      hint="Tap Enter to add more entries"
      :rules="entryRules"
      @keyup="addEntry($event)"
    />
    <v-chip
      v-for="(entry, index) in newCard.cells"
      class="!p-5 m-2"
      closable
      @click:close="delete newCard.cells[index]"
    >
      {{ entry }}
    </v-chip>
    <ConfirmDialog
      dialog-button-text="Create"
      :dialog-title="validateCardName() ? 'Create New Card?' : 'Please name the card'"
      :dialog-text="validateCardName() ? `A new bingo card will be created with your provided entries. ${newCard.cells.length === 24 ?
        '' : 24 - newCard.cells.length + (newCard.cells.length === 23 ? ' entry ' : ' entries ') + 'will be filled with randomly generated text'}` : 'Every card needs a name. Think of something special for this one.'"
      :action-buttons="[
        {
          buttonText: 'Cancel',
        },
        {
          buttonText: validateCardName() ? 'Create Bingo Card' : 'Name Bingo Card',
          onClick: validateCardName() ? handleSave : () => ''
        }, 
      ]"
      :loading="creating"
    />
  </div>
</template>

<script setup lang="ts">
  import type Card from "~/interfaces/Card";
  import type User from "~/interfaces/User";
  import { Filter } from "bad-words";

  const { $storage, $toast } = useNuxtApp();
  const { data, getSession } = useAuth();
  const sessionUser = computed(() => data.value?.user as User);
  const router = useRouter();
  const creating = ref(false);
  const newCard = ref<{
    name: string,
    cells: string[]
  }>({
    name: "",
    cells: [],
  });
  const currentEntry = ref("");

  const filter = new Filter();

  const entryRules = [
    // Check that each entry entry is not more than 32 characters
    (value: string) => value.length <= 32 || 'An entry must contain no more than 32 characters',
    // Check that each word is not more than 9 characters
    (value: string) => value.split(/\.|\s|,\s|;\s|:\s|-/g).find(word => word.length > 9) === undefined
      || 'Each word must be less than 10 characters. You can break your words with a dash (-)',
    // Check that each entry does not contain any profanity
    (value: string) => !filter.isProfane(value) || 'An entry must not contain any profane words',
  ];

  const cardNameRules = [
    (value: string) => !!value || 'You have to call it something',
    (value: string) => value.trim() !== '' || 'You have to call it something with real characters',
    (value: string) => value.trim().length >= 3 || 'You have to call it something with at least 2 real characters. Please',
    (value: string) => !filter.isProfane(value) || 'A card name cannot contain profane words',
  ];

  function validateCardName() {
    if(!!cardNameRules.find(rule => typeof rule(newCard.value.name.trim()) === "string")){
      return false;
    } else {
      return true;
    }
  }

  function validateEntry() {
    if(!!entryRules.find(rule => typeof rule(currentEntry.value.trim()) === "string")){
      return false;
    } else {
      return true;
    }
  }

  function addEntry(event: KeyboardEvent) {
    if (validateEntry() && event.key === "Enter") {
      newCard.value.cells.push(currentEntry.value.trim());
      currentEntry.value = '';
    }
  }

  async function handleSave() {
    if (validateCardName()) {
      creating.value = true;
      await $fetch<Card>("/api/cards/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newCard.value.name.trim(),
          cells: newCard.value.cells.filter(cell => !!cell),
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
      $storage.setData("bingoUser", sessionUser.value);
      creating.value = false;
      
      router.push(`/cards?s=${newCard.value.name.trim()}`);
      $toast.success(`${newCard.value.name.trim()} created`);
    } else {
      $toast.error('Could not create card')
    }
  }
</script>