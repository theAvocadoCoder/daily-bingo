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

  const { $storage } = useNuxtApp();
  const gStore = useGroupStore();
  const { scrollY } = useUpdateScroll();
  const { isLoaded, isSignedIn } = useAuth();
  const route = useRoute();

  const groupDetails = ref($storage.getData("currentGroup") as Group);


  onMounted(async () => {
    document.documentElement.scrollTop = toValue(scrollY);
    if (!groupDetails.value) {
      await gStore.fetchGroup(`${route.params.id}`);
      groupDetails.value = gStore.group!;
    }

  })
</script>
