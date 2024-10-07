<template>
  <div class="h-full bg-lime-50 relative">
    <v-btn class="" icon="mdi-arrow-left" variant="text" @click="$router.back()"></v-btn>

    <h1 class="sr-only">Create a New Group</h1>

    <div class="flex flex-col gap-4 items-center p-5 lg:p-10">
      <div class="relative w-fit h-fit aspect-square border-2 border-dashed border-zinc-300 rounded-full flex items-center justify-center cursor-pointer overflow-hidden">
        <v-hover v-slot="{ isHovering, props }">
          <!-- Image Preview -->
          <v-img
            v-if="imageUploaded"
            :src="newGroup.picture"
            alt="Image preview"
            class="w-28 h-28 object-cover"
          />

          <!-- Placeholder when no image is selected -->
          <v-avatar v-if="!imageUploaded" class="!border !border-slate-400 !bg-zinc-300" icon="mdi-account" :image="sessionUser.picture" size="108" rounded="0"></v-avatar>

          <!-- File input (hidden) -->
          <input
            id="image-input"
            type="file"
            ref="fileInput"
            class="hidden"
            @change="handleImageChange"
            accept="image/*"
          />

          <!-- Pencil Icon Overlay -->
          <v-card tag="label" for="image-input" v-bind="props" :class="`!absolute top-0 right-0 !rounded-full w-full aspect-square ${isHovering ? '!bg-zinc-400/50' : '!bg-transparent'} !flex !items-center !justify-center !cursor-pointer`">
            <v-icon v-if="isHovering" large>mdi-pencil</v-icon>
          </v-card>
        </v-hover>
      </div>
          
      <v-text-field
        class="w-full max-w-md"
        v-model="newGroup.name"
        label="Group Name"
        :rules="groupNameRules"
      />
    </div>

    <ConfirmDialog
      dialog-button-text="Create"
      :dialog-title="validateGroupName() ? 'Create New Group?' : 'Please name the group'"
      :dialog-text="validateGroupName() ? `A new group will be created.` : 'Every group needs a name. Think of something special for this one.'"
      :action-buttons="[
        {
          buttonText: 'Cancel',
        },
        {
          buttonText: validateGroupName() ? 'Create Bingo Group' : 'Name Bingo Group',
          onClick: validateGroupName() ? handleSave : () => ''
        }, 
      ]"
      :loading="creating"
    />
  </div>
</template>

<script setup lang="ts">
  import type Group from '~/interfaces/Group';
  import type User from '~/interfaces/User';
  import { Filter } from "bad-words";

  const { setData } = useNuxtApp().$locally;
  const { data, getSession } = useAuth();
  const sessionUser = computed(() => data.value?.user as User);
  const router = useRouter();
  const { $toast } = useNuxtApp();
  const creating = ref(false);
  const newGroup = ref({
    picture: sessionUser.value.picture,
    name: ""
  });
  const imageUploaded = ref(false);

  const filter = new Filter();

  const groupNameRules = [
    (value: string) => !!value || 'You have to call it something',
    (value: string) => value.trim() !== '' || 'You have to call it something with real characters',
    (value: string) => value.trim().length >= 3 || 'You have to call it something with at least 2 real characters. Please',
    (value: string) => !filter.isProfane(value) || 'A group name cannot contain profane words',
  ];

  function validateGroupName() {
    if (!!groupNameRules.find(rule => typeof rule(newGroup.value.name.trim()) === "string")) {
      return false;
    } else {
      return true;
    }
  }

  function handleImageChange(event) {
    const file = event.target.files[0];
    if (file) imageToDataURL(file);
  }

  function imageToDataURL(img) {
    const reader = new FileReader();

    reader.onload = (e) => {
      userModel.value.picture = e.target.result;
    };

    reader.readAsDataURL(img);
    imageUploaded.value = true;
  }

  async function handleSave() {
    if (validateGroupName()) {
      creating.value = true;
      if (imageUploaded.value !== true) {
        newGroup.value.picture = "";
      }
      await $fetch<Group>("/api/groups/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          creator: {
            user_id: sessionUser.value?._id,
            username: sessionUser.value?.username,
          },
          name: newGroup.value.name.trim(),
          picture: newGroup.value.picture,
        })
      }).then(async (savedGroup) => {
        if (savedGroup) {
          await $fetch(`/api/users/${sessionUser.value?._id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: savedGroup._id,
              operation: "groups-insert",
            }),
          });
        }
      });
      // @ts-expect-error
      await getSession(true);
      setData("bingoUser", sessionUser.value, true);
      creating.value = false;

      router.push(`/groups?s=${newGroup.value.name.trim()}`);
      $toast.success(`${newGroup.value.name} created.`);
    } else {
      $toast.error('Could not create new group');
    }
  }
</script>