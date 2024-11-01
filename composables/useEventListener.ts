import type { EventCallbacks, EventType } from "next-auth"

export function useEventListener< K extends keyof WindowEventMap > (
  target: EventTarget,
  event: K | string,
  callback: ((event: WindowEventMap[K]) => void )| (({ detail }: { detail: any }) => void)
) {
  onMounted(() => target.addEventListener(event, callback as EventListener))
  onUnmounted(() => target.removeEventListener(event, callback as EventListener))
}