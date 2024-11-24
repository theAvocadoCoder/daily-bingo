<template>
  <div class="bg-zinc-100 h-full p-10" v-if="!isLoaded">
    <Loading />
  </div>
  <div class="bg-zinc-100 h-full p-10 flex justify-center" v-else-if="!isSignedIn">
    <v-btn tag="nuxt-link" to="sign/in">Sign in to view this page</v-btn>
  </div>
  <div class="bg-zinc-100 h-full p-10" v-else>
    <p>{{ groupDetails?.name }}</p>

    <p>Members</p>
    <ul>
      <li v-for="member in groupDetails?.members">
        {{ member?.username }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
  import type Group from '~/interfaces/Group';
  import { storeToRefs } from "pinia";

  const { $lstorage } = useNuxtApp();
  const gStore = useGroupStore();
  const store = useGlobalStore();
  const { group } = storeToRefs(gStore);
  const { fetchGroup } = gStore;
  const { preservedY } = storeToRefs(store);
  const { isLoaded, isSignedIn } = useAuth();
  const route = useRoute();

  const groupDetails = ref($lstorage.getData("currentGroup") as Group);


  onMounted(async () => {
    document.documentElement.scrollTop = preservedY;
    console.log("y on mount", toValue(preservedY));
    if (!groupDetails.value) {
      await fetchGroup(`${route.params.id}`);
      groupDetails.value = group!;
    }

  })
</script>
