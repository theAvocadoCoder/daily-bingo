<template>
  <div class="h-full bg-lime-50 relative">
    <v-btn class="" icon="mdi-arrow-left" variant="text" @click="$router.back()"></v-btn>
    <h1>New Card Page</h1>
    <v-text-field
      v-model="newCard.name"
      label="Name"
    >
    </v-text-field>
    <v-btn @click="handleSave">save</v-btn>
  </div>
</template>

<script setup lang="ts">
  const router = useRouter();
  const { $toast } = useNuxtApp();
  const newCard = ref({
    name: ""
  })

  function handleSave() {
    router.push(`/cards?s=${newCard.value.name}`)
    $toast.success(`${newCard.value.name} created`)
  }
</script>