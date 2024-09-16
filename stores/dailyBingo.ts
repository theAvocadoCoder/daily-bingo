import { defineStore, acceptHMRUpdate } from "pinia";
import type Card from "~/server/interfaces/Card";

export const useDailyBingoStore = defineStore("dailyBingo", () => {
  const { getData, setData } = useNuxtApp().$locally; 
  const card = ref<Card>();
  const getDailyBingo = computed(() => card.value);
  
  async function fetchDailyBingo () {
    const dailyBingoInStorage = getData("dailyBingo");
    try {
      if (!dailyBingoInStorage) {
        const data = await $fetch("/api/cards/daily");
        card.value = data as unknown as Card;
        setData("dailyBingo", card.value, false, [1, "d"]);
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
