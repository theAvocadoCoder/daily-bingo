<template>
  <div>
    <h1>
      Your Cards
    </h1>

    <ul class="flex flex-col gap-2">
      <li v-for="(card, index) in sessionUser.cards">
        <v-card
          tag="nuxt-link"
          :to="`/cards/${card._id}`"
          :title="card.card_name"
          :subtitle="`by ${card.created_by.username}`"
        ></v-card>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
  const {data} = useAuth();

  const sessionUser = computed(() => data.value?.user);
</script>