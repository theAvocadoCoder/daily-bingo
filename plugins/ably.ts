import Ably from "ably";

export default defineNuxtPlugin(() => {
  const { ablyRoot } = useRuntimeConfig();

  // Create the Ably client
  const ably = new Ably.Realtime({
    key: ablyRoot
  });

  return {
    provide: { ably }
  }
})
