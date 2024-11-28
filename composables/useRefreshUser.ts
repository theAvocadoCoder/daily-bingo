
export function useRefreshUser() {
  const { $lstorage } = useNuxtApp();

  async function getUser() {
    const user = await $fetch("/api/users/current-user")
    $lstorage.setData("bingoUser", user);
    return user;
  }

  return {
    getUser,
  }
}
