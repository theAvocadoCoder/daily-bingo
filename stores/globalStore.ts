// stores/globalStore.ts
import { defineStore, acceptHMRUpdate } from 'pinia';

export const useGlobalStore = defineStore('global', () => {
  const scrollY = ref(0);
  const preservedY = ref(0);

  useEventListener(window, "scroll", updateScrollPosition);

  function updateScrollPosition() {
    scrollY.value = window.scrollY;
  }

  function preserveScrollPosition(posY: number) {
    preservedY.value = posY;
  }

  return { scrollY, preservedY, updateScrollPosition, preserveScrollPosition }
  
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGlobalStore, import.meta.hot));
}
