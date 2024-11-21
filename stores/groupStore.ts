// stores/groupStore.ts
import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref } from 'vue';
import type Group from '~/interfaces/Group';

export const useGroupStore = defineStore('group', () => {
  const { $lstorage } = useNuxtApp();

  const group = ref<Group | null>();
  const getGroup = computed(() => group.value);
  const isLoading = ref(false);
  const error = ref(null);

  // Fetch group data by ID
  async function fetchGroup(id: string) {
    try {
      isLoading.value = true;
      error.value = null;
      
      const results = await $fetch<Group>(`/api/groups/${id}`);
      if (!results) throw new Error('Failed to fetch group data');
      
      group.value = results;
      $lstorage.setData("currentGroup", group.value);
    }
    catch (err: any) {
      error.value = err;
    }
    finally {
      isLoading.value = false;
    }
  }

  async function clearGroup() {
    group.value = null
    $lstorage.setData("currentGroup", group.value);
  }

  return { group: getGroup, isLoading, error, fetchGroup, clearGroup };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGroupStore, import.meta.hot));
}
