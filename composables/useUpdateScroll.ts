
export function useUpdateScroll() {
  const scrollY = ref(0);
  const preservedY = ref(0);

  useEventListener(window, "scroll", updateScrollPosition);

  function updateScrollPosition() {
    scrollY.value = window.scrollY;
  }

  function preserveScrollPosition(posY: number) {
    preservedY.value = posY
  }

  return { scrollY, preservedY, preserveScrollPosition };
}