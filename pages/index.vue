<template>
  <div>
    <h1>Daily Bingo!</h1> 
    <p>
      {{ user?.greeting }}, {{ user?.displayName }}
    </p>

    <Bingo :card="dailyBingo?.cells" />
  </div>
</template>

<script setup lang="ts">
  import { ref } from "vue";
  import type User from "~/server/interfaces/User";
  import type Card from "~/server/interfaces/Card";
  // @ts-expect-error
  import { getData, setData } from "nuxt-storage/local-storage";

  interface ReturnUser extends User { greeting: string };
  interface ReturnCard extends Card { _: "" };

  let user: Ref<ReturnUser>;
  let userError: unknown;
  const userInStorage = getData("user");

  let dailyBingo: Ref<ReturnCard>;
  let cardError: unknown;
  const cardInStorage = getData("dailyBingo");

  if (userInStorage) {
    user = ref(userInStorage as ReturnUser)
  } else {
    const userId = "66d8754397e9d9f8ccb56203";
    const { data, error } = await useFetch(`/api/users/${userId}`);
    user = ref(data.value as unknown as ReturnUser);
    userError = error.value as Error;
    setData("user", user.value, 30, "d");
  }

  if (cardInStorage) {
    dailyBingo = ref(cardInStorage as ReturnCard);
  } else {
    const { data, error } = await useFetch("/api/cards/daily");
    dailyBingo = ref(data.value as unknown as ReturnCard);
    cardError = error.value as Error;
    setData("dailyBingo", dailyBingo.value, 1, "d");
  }
</script>