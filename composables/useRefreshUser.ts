
export function useRefreshUser() {
  const { $storage } = useNuxtApp();

  async function getUser() {
    const sessionUser = await $fetch("/api/users/current-user");
    $storage.setData("bingoUser", sessionUser);
  }

  return {
    getUser,
  }
}
