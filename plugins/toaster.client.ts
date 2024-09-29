import { useToast } from "vue-toast-notification"; 
import 'vue-toast-notification/dist/theme-default.css';

export default defineNuxtPlugin(() => {
  const toast = useToast({
    position: "top-right"
  });
  return {
    provide: {
      toast,
    },
  };
});