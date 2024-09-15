<template>
  <div class="bg-lime-50">
    <!-- <p class="p-3 lg:p-5 text-lg lg:text-xl xl:text-2xl">
      Hi, {{ user?.user?.displayName }}
    </p> -->

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