<template>
  <div class="h-full bg-lime-50 relative">
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

    <ul class="flex flex-col gap-2">
      <li v-for="(group, index) in displayedgroups">
        <v-group
          class="!bg-lime-100 hover:!bg-lime-200/80"
          :tag="editMode == group._id ? 'div' : 'nuxt-link'"
          @click.prevent="editMode == group._id"
          :to="`/groups/${group._id}`"
        >
          <v-group-text class="flex justify-between items-center !py-3 !px-2">
            <div>
              <v-form v-if="editMode === group._id" @submit.prevent="handleSaveEdit(group._id)" @click.prevent class="flex items-center w-fit px-4">
                <v-text-field
                  class="min-w-32 m-0"
                  v-model="groupModel.group_name"
                  :placeholder="group.name"
                  label="group Name"
                  variant="underlined"
                ></v-text-field>
                <v-btn icon="mdi-close" variant="text" :disabled="saving" @click.prevent="handleCancelEdit"></v-btn>
                <v-btn type="submit" :loading="saving" @click.prevent="handleSaveEdit(group._id)">Save</v-btn>
              </v-form>
              <v-group-title v-else class="!text-lg truncate max-w-32 min-[330px]:max-w-40 min-[425px]:max-w-64 sm:max-w-72 md:max-w-96">{{ group.name }}</v-group-title>
              <v-group-subtitle>by {{ `${ group.creator.user_id ? '@' : '' }${ group.creator.username }` }}</v-group-subtitle>
            </div>
            <div>
              <v-btn v-if="group.creator?.user_id === sessionUser._id || group.creator?.username === 'Daily Bingo'" :icon="editMode == group._id ? 'mdi-check' : 'mdi-pencil'" :disabled="!!editMode && editMode != group._id" variant="text" @click.prevent="handleSaveEdit(group._id)"></v-btn>
              <v-btn icon="mdi-delete" :disabled="!!editMode && editMode != group._id" variant="text" @click.prevent="cancelDialog = true; selectedGroupId = group._id"></v-btn>
              <v-dialog v-model="cancelDialog" width="auto">
                <v-group
                  :max-width="400"
                >
                  <v-group-title>Delete Bingo group?</v-group-title>
                  <v-group-text>
                    <p>
                      This will permanently delete this group from your collection. The group will still be available on groups it has been shared to, and in the collections of users who have saved it.
                    </p>
                  </v-group-text>
                  <v-group-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                      class="mb-auto hover:!bg-gray-900/20 !bg-gray-300/50"
                      @click="cancelDialog = false; selectedGroupId = ''"
                    >
                      Cancel
                    </v-btn>
                    <v-btn
                      class="mb-auto hover:!bg-red-600 !bg-red-700 !font-bold text-white"
                      @click="handleDelete()"
                    >
                      Delete group
                    </v-btn>
                  </v-group-actions>
                </v-group>
              </v-dialog>
            </div>
          </v-group-text>
        </v-group>
      </li>
      <template v-if="!displayedgroups">
        <Loading />
      </template>
      <template v-if="displayedgroups?.length == 0">
        <li class="text-zinc-600 [&_a]:text-lime-600 [&_a]:font-bold">
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

  const usergroups = ref<Group[]>();

  // const {data: results} = await useFetch<Group[]>("/api/groups", {
  usergroups.value = await $fetch<Group[]>("/api/groups", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      groups: sessionUser.value?.groups
    }),
  });
  // usergroups.value = toRaw(results.value as Group[]);

  const displayedgroups = computed(() => {
    if (searchValue.value === null) {
      return usergroups.value;
    } else {
      return usergroups.value?.filter(group => (
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

        usergroups.value = await $fetch<Group[]>("/api/groups", {
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
      usergroups.value = await $fetch<Group[]>("/api/groups", {
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