export default defineNuxtPlugin(() => {
  return {
    provide: {
      locally: {
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
        setData(key: string, value: any, update?: boolean, expiry?: [number, ("s"|"m"|"h"|"d")]) {
          if (import.meta.client) {
            localStorage.setItem(key, JSON.stringify(value));
            const unitConversion = {
              "s": 1000,
              "m": 60_000,
              "h": 3_600_000,
              "d": 86_400_000,
            }
            if (!expiry) expiry = [14, "d"];
            const timeInMs = expiry[0] * unitConversion[expiry[1]];

            if (update !== true) {
              setTimeout(() => {
                localStorage.removeItem(key);
              }, timeInMs);
            }
            console.log(key, timeInMs);
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