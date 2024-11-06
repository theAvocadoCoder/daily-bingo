
export function useUpdateScroll() {
  const scrollY = ref();

  useEventListener(window, "scroll", updateScrollPosition);

  function updateScrollPosition() {
    scrollY.value = window.scrollY;
  }

  return { scrollY };
}