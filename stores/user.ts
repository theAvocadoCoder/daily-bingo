import { defineStore } from "pinia";
import type User from "~/server/interfaces/User";

export const useUserStore = defineStore("user", () => {
  const { getData, setData } = useNuxtApp().$locally; 
  const user = ref<User>();
  const getUser = computed(() => user.value);
  
  async function fetchUser () {
    const userInStorage = getData("bingoUser");
    try {
      if (!userInStorage) {
        const userId = "66d8754397e9d9f8ccb56203";
        const data = await $fetch(`/api/users/${userId}`);
        user.value = data as unknown as User;
        setData("bingoUser", user.value as User, false, [14, "d"]);
      } else {
        user.value = userInStorage;
      }
    } catch (error) {
      throw createError({ statusCode: 500, statusMessage: "User not found", fatal: true })
    }
  }

  return {
    user,
    getUser,
    fetchUser,
  }
})
