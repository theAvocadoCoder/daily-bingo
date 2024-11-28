<template>
  <div class="h-fit bg-lime-50 relative" v-if="!isLoaded">
    <Loading />
  </div>
  <div class="h-fit bg-lime-50 relative flex justify-center" v-else-if="!isSignedIn">
    <v-btn tag="nuxt-link" to="sign/in">Sign in to view this page</v-btn>
  </div>
  <div class="h-full bg-lime-50 relative" v-else>
    <v-btn class="" icon="mdi-arrow-left" variant="text" @click="$router.back()"></v-btn>

    <h1 class="sr-only">Create a New Group</h1>

    <div class="flex flex-col gap-4 items-center p-5 lg:p-10">
      <div class="relative w-fit h-fit aspect-square border-2 border-dashed border-zinc-300 rounded-full flex items-center justify-center cursor-pointer overflow-hidden">
        <v-hover v-slot="{ isHovering, props }">
          <!-- Image Preview -->
          <v-img
            v-if="imageUploaded"
            :src="`${newGroup.picture}`"
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
  import { Filter } from "bad-words";

  const { $lstorage, $toast } = useNuxtApp();
  const { isLoaded, isSignedIn } = useAuth();
  const { getUser } = useRefreshUser();
  const sessionUser = ref($lstorage.getData("bingoUser"));
  const router = useRouter();
  const creating = ref(false);
  const newGroup = ref<{
    picture: string | ArrayBuffer,
    name: string
  }>({
    picture: "/img/default-group-img.webp",
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

  function handleImageChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.item(0);
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        newGroup.value.picture = (e.target as FileReader).result as string | ArrayBuffer;
      };

      reader.readAsDataURL(file);
      imageUploaded.value = true;
    }
  }

  async function handleSave() {
    if (validateGroupName()) {
      creating.value = true;
      if (imageUploaded.value !== true) {
        // Set the default image if the user does not select an image
        const defaultGroupImagePath = "/img/default-group-img.webp";
        const defaultGroupImageBlob = await fetch(defaultGroupImagePath).then(res => res.blob());
        if (defaultGroupImageBlob) {
          const reader = new FileReader();

          reader.onload = (e) => {
            newGroup.value.picture = (e.target as FileReader).result as string | ArrayBuffer;
          };

          reader.readAsDataURL(defaultGroupImageBlob);
          imageUploaded.value = true;
        }
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

      sessionUser.value = await getUser();
      creating.value = false;

      router.push(`/groups?s=${newGroup.value.name.trim()}`);
      $toast.success(`${newGroup.value.name} created.`);
    } else {
      $toast.error('Could not create new group');
    }
  }
</script>