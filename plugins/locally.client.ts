export default defineNuxtPlugin(() => {
  return {
    provide: {
      lstorage: {
        getData(key: string) {
          if (import.meta.client) {
            const itemString = localStorage.getItem(key);
            if (itemString) {
              return JSON.parse(itemString);
             } else {
              return undefined
             }
          } else {
            return undefined;
          }
        },
        setData(key: string, value: any) {
          if (import.meta.client) {
            localStorage.setItem(key, JSON.stringify(value));
            // Emit a custom event to notify other components
            window.dispatchEvent(new CustomEvent("lstorage-update", { 
              detail: { key, value } 
            }));
            
            const unitConversion = {
              "s": 1000,
              "m": 60_000,
              "h": 3_600_000,
              "d": 86_400_000,
            }
          }
        },
        clear() {
          if (import.meta.client) {
            localStorage.clear()
          }
        }
      }
    }
  }
})