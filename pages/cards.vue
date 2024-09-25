<template>
  <div>
    <h1>
      Your Cards
    </h1>

    <ul class="flex flex-col gap-2">
      <li v-for="(card, index) in sessionUser.cards">
        <v-card
          :title="`Bingo Card #${index+1}`"
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