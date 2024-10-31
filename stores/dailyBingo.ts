import { defineStore, acceptHMRUpdate } from "pinia";
import type Card from "~/interfaces/Card";

export const useDailyBingoStore = defineStore("dailyBingo", () => {
  const { $storage } = useNuxtApp(); 
  const card = ref<Card>();
  const getDailyBingo = computed(() => card.value);
  
  async function fetchDailyBingo () {
    const dailyBingoInStorage = $storage.getData("dailyBingo");
    try {
      if (!dailyBingoInStorage) {
        const data = await $fetch("/api/cards/daily");
        card.value = data as unknown as Card;
        $storage.setData("dailyBingo", card.value);
      } else {
        card.value = dailyBingoInStorage;
      }
    } catch (error) {
      throw createError({ statusCode: 500, statusMessage: "Could not generate daily bingo card", fatal: true })
    }
  }

  return {
    card,
    getDailyBingo,
    fetchDailyBingo
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDailyBingoStore, import.meta.hot));
}
