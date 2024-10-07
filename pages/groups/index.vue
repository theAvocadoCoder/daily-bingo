<template>
  <div class="h-full bg-lime-50 [&>*]:mx-auto relative">
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
      <li v-for="(group, index) in displayedgroups">
        <v-card
          class="!bg-transparent hover:!bg-lime-700/10 !border-b !py-3 !border-b-lime-950/20"
          elevation="0"
          :tag="editMode == group._id ? 'div' : 'nuxt-link'"
          @click.prevent="editMode == group._id"
          :to="`/groups/${group._id}`"
        >
          <v-card-text class="flex justify-between items-center !py-3 !px-2">
            <div class="contents">
              <v-avatar icon="mdi-group" :image="group.picture === '' ? sessionUser.picture : group.picture" size="64"></v-avatar>
              <div class="w-full truncate max-w-full">
                <v-card-title class="!text-lg">{{ group.name }}</v-card-title>
                <v-card-subtitle>by {{ `${ group.creator.user_id ? '@' : '' }${ group.creator.username }` }}</v-card-subtitle>
              </div>
            </div>
            <div>
              <v-badge
                v-if="group.history.length"
                class="bg-lime-600 rounded-full [&_span]:!text-sm lg:[&_span]:!text-lg [&_span]:!text-white [&_span]:!font-bold inline-flex justify-center items-center w-fit px-0.5 py-1"
                color="transparent"
                :content="group.history.length"
                inline
              ></v-badge>
            </div>
          </v-card-text>
        </v-card>
      </li>
      <template v-if="!displayedgroups">
        <Loading />
      </template>
      <template v-if="displayedgroups?.length == 0">
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
  const { setData } = useNuxtApp().$locally;
  const { $toast } = useNuxtApp();
  const { data, getSession } = useAuth();
  const route = useRoute();

  const sessionUser = computed(() => data.value?.user as User);
  const groupModel = ref({
    group_name: ""
  });

  const searchValue = ref<null | string>(route?.query?.s ? (route.query.s as string) : null);
  const cancelDialog = ref(false);
  const selectedGroupId = ref();
  const editMode = ref<unknown | boolean>(false);
  const saving = ref(false);

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

  const displayedgroups = computed(() => {
    const groups = Array.isArray(userGroups.value) ? userGroups.value : [];
    if (searchValue.value === null) {
      return groups;
    } else {
      return groups?.filter(group => (
        group.name.toLocaleLowerCase().includes((searchValue.value as string).toLocaleLowerCase())
      ));
    }
  });

  function handleSearchFocusOut() {
    // If the search value is empty, set it to null
    if (searchValue.value && (searchValue.value === "" || searchValue.value.trim().length < 1)) {
      searchValue.value = null
    }
  }

  function handleCancelEdit() {
    groupModel.value.group_name = "";
    editMode.value = false;
  }

  async function handleSaveEdit(groupId?: unknown) {
    const thegroup = displayedgroups.value?.find(group => group._id == groupId);

    if (editMode.value == groupId) {
      saving.value = true;

      if (groupModel.value && groupModel.value.group_name == "") {
        const previousgroupName = thegroup?.name || "";
        groupModel.value.group_name = previousgroupName;
      }

      if (thegroup?.creator?.user_id === sessionUser.value._id || thegroup?.creator.username === "Daily Bingo") {
        await $fetch(`/api/groups/${thegroup?._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            group: {
              name: groupModel.value.group_name,
            },
          }),
        });

        // @ts-expect-error
        await getSession(true);

        userGroups.value = await $fetch<Group[]>("/api/groups", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
            "Expires": "0",
          },
          body: JSON.stringify({
            groups: sessionUser.value?.groups,
          }),
        });
      }
      // setData("bingoUser", sessionUser.value, true);
      groupModel.value.group_name = "";
      saving.value = false;
      editMode.value = false;
    } else {
      editMode.value = groupId || false;
    }
  }

  async function handleDelete() {
    saving.value = true;
    cancelDialog.value = false;

    const thegroup = displayedgroups.value?.find(group => group._id == selectedGroupId.value) as Group;

    let deleteObject = null;

    if (thegroup?.creator?.user_id === sessionUser.value._id) {
      deleteObject = {
        group: { isDeleted: true },
      };
    }

    await $fetch(`/api/groups/${thegroup?._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        operation: -1,
        ...deleteObject,
      }),
    }).then(async () => {
      return await $fetch<User>(`/api/users/${sessionUser.value._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: thegroup._id,
          operation: "groups-delete"
        }),
      });
    }).then(async (theUser) => {
      userGroups.value = await $fetch<Group[]>("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
          "Expires": "0",
        },
        body: JSON.stringify({
          groups: theUser?.groups,
        }),
      });

      // @ts-expect-error
      await getSession(true);
      setData("bingoUser", sessionUser.value, true);
      $toast.success("group deleted");
      saving.value = false;
      selectedGroupId.value = '';
    });
  }
</script>