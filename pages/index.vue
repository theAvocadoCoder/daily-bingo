<template>
  <div class="bg-lime-50 h-full">
    <!-- <p class="p-3 lg:p-5 text-lg lg:text-xl xl:text-2xl">
      Hi, {{ user?.user?.displayName }}
    </p> -->

    <Bingo :card="(dailyBingo as unknown as Cell[])" />
  </div>
</template>

<script setup lang="ts">
  import type Card from "~/server/interfaces/Card";
  import type Cell from "~/server/interfaces/Cell";

  const {data: user} = await useFetch("/api/users/66d8754397e9d9f8ccb56203")
  const {data: dailyBingo} = await useFetch("/api/cards/daily");

  // const dailyBingo = useDailyBingoStore();
  // const user = useUserStore();

  // await useAsyncData("dailyBingo", () => dailyBingo.fetchDailyBingo().then(()=>true));

  // await useAsyncData("user", () => user.fetchUser().then(()=>true));
</script>