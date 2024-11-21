<template>
  <div class="h-fit [&>*]:mx-auto relative" v-if="!isLoaded">
    <Loading />
  </div>
  <div class="h-fit [&>*]:mx-auto relative flex justify-center" v-else-if="!isSignedIn">
    <v-btn tag="nuxt-link" to="sign/in">Sign in to view this page</v-btn>
  </div>
  <div class="h-fit [&>*]:mx-auto relative" v-else>
    <v-btn tag="nuxt-link" to="/groups/new" :class="`!fixed bottom-20 right-5 z-20 p-5 !bg-lime-700 hover:!bg-lime-900 !text-lime-50`" icon="mdi-plus"></v-btn>
    <h1 class="sr-only">
      Your groups
    </h1>

    <v-text-field
      v-model="searchValue"
      rounded
      color="zinc-200/80"
      variant="outlined"
      label="Search groups"
      aria-role="search"
      class="max-w-3xl"
      @focusout="handleSearchFocusOut"
    >
      <template v-slot:append-inner>
        <v-btn
          variant="text"
          @click="searchValue !== null ? searchValue = null : ''"
          :icon="searchValue === null ? 'mdi-magnify' : 'mdi-close'"
        ></v-btn>
      </template>
    </v-text-field>

    <ul class="flex flex-col gap-2 max-w-3xl">
      <li v-for="(group) in displayedGroups">
        <v-card
          class="!bg-transparent hover:!bg-lime-700/10 !border-b !py-3 !border-b-lime-950/20"
          elevation="0"
          tag="nuxt-link"
          :to="`/groups/${group._id}`"
        >
          <v-card-text class="flex justify-between items-center !py-3 !px-2">
            <div class="contents">
              <v-avatar
                icon="mdi-group"
                :image="group.picture === '' ? '/img/default-group-img.webp' : group.picture"
                size="64"
                @click.prevent="groupDialog = true"
              ></v-avatar>
              <v-dialog v-model="groupDialog" width="auto">
                <v-card max-width="400">
                  <v-card-title>{{ group.name }}</v-card-title>
                  <v-avatar
                    icon="mdi-group"
                    :image="group.picture === '' ? '/img/default-group-img.webp' : group.picture"
                    size="104"
                    @click.prevent="groupDialog = true"
                  ></v-avatar>
                  <div class="">
                    <v-btn
                      icon="mdi-information-outline"
                      tag="nuxt-link"
                      :to="`/groups/${group._id}/details`"
                    ></v-btn>
                  </div>
                </v-card>
              </v-dialog>
              
              <div class="w-full truncate max-w-full">
                <v-card-title class="!text-lg">{{ group.name }}</v-card-title>
                <v-card-subtitle>
                  <span class="font-bold" v-if="getLastMessage(group?.history)?.sender?.user_id">{{ `@${ group.history[group.history.length - 1]?.sender.username }: ` }}</span>
                  <span>{{ `${ getLastMessage(group?.history)?.text }` }}</span>
                </v-card-subtitle>
              </div>
            </div>
            <div>
              <v-badge
                v-if="group.history?.length"
                class="bg-lime-600 rounded-full [&_span]:!text-sm lg:[&_span]:!text-lg [&_span]:!text-white [&_span]:!font-bold inline-flex justify-center items-center w-fit px-0.5 py-1"
                color="transparent"
                :content="group.history?.length"
                inline
              ></v-badge>
            </div>
          </v-card-text>
        </v-card>
      </li>
      <template v-if="!displayedGroups">
        <Loading />
      </template>
      <template v-if="displayedGroups?.length == 0">
        <li class="text-zinc-600 [&_a]:text-lime-600 [&_a]:font-bold text-center">
          <template v-if="searchValue !== null">
            <span>You have no groups that match this search.</span>
            <span>Try <nuxt-link to="/groups/new">creating one</nuxt-link></span>
          </template>
          <template v-else>
            <span>You haven't joined any groups yet.</span> 
            <span>Try <nuxt-link to="/groups/new">creating a new group</nuxt-link></span>
          </template>
        </li> 
      </template>
    </ul>
  </div>
</template>

<script setup lang="ts">
  import type User from "~/interfaces/User";
  import type Group from "~/interfaces/Group";

  const { isLoaded, isSignedIn } = useAuth();
  const { $lstorage } = useNuxtApp();
  const route = useRoute();

  const groupDialog = ref(false);

  const sessionUser = computed(() => $lstorage.getData("bingoUser") as User);

  const searchValue = ref<null | string>(route?.query?.s ? (route.query.s as string) : null);

  const userGroups = ref<Group[]>();

  userGroups.value = await $fetch<Group[]>("/api/groups", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      groups: sessionUser.value?.groups
    }),
  });

  const displayedGroups = computed(() => {
    const groups = Array.isArray(userGroups.value) ? userGroups.value : [];
    if (searchValue.value === null) {
      return groups;
    } else {
      return groups?.filter(group => (
        group.name.toLocaleLowerCase().includes((searchValue.value as string).toLocaleLowerCase())
      ));
    }
  });

  function getLastMessage(history: Group['history']) {
    if (!history || !Array.isArray(history)) return;

    const length = history.length;
    return history[length - 1] || "";
  }

  function handleSearchFocusOut() {
    // If the search value is empty, set it to null
    if (searchValue.value && (searchValue.value === "" || searchValue.value.trim().length < 1)) {
      searchValue.value = null
    }
  }
</script>