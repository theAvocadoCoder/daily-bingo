
export function useRefreshUser() {
  const { $lstorage } = useNuxtApp();

  async function getUser() {
    const sessionUser = await $fetch("/api/users/current-user");
    $lstorage.setData("bingoUser", sessionUser);
  }

  return {
    getUser,
  }
}
