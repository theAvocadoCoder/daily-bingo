<template>
  <div>
    <h1>Daily Bingo!</h1> 
    <p>
      Welcome back, {{ user?.user?.displayName }}
    </p>

    <client-only>
      <Bingo :card="(dailyBingo?.card?.cells as Cell[])" />
    </client-only>
  </div>
</template>

<script setup lang="ts">
  import {  onBeforeMount } from "vue";
  import { useDailyBingoStore } from "~/stores/dailyBingo";
  import { useUserStore } from "~/stores/user";
  import type Cell from "~/server/interfaces/Cell";

  const dailyBingo = useDailyBingoStore();
  const user = useUserStore();

  onBeforeMount(async () => {
    await useAsyncData("dailyBingo", () => dailyBingo.fetchDailyBingo().then(()=>true));
  });

  onBeforeMount(async () => {
    await useAsyncData("user", () => user.fetchUser().then(()=>true));
  });
</script>