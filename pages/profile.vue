<template>
  <div class="bg-zinc-200 h-full flex flex-col gap-5 relative">
    <v-btn class="" icon="mdi-arrow-left" variant="text" @click="$router.back()"></v-btn>
    <v-btn v-if="$vuetify.display.lgAndUp" :loading="saving" :class="`!fixed bottom-20 right-5 z-20 ${editMode ? '!bg-zinc-100 !text-zinc-600' : '!bg-zinc-700 !text-lime-50'}`" :append-icon="editMode ? 'mdi-content-save' : 'mdi-pencil'" :text="editMode ? 'SAVE' : 'EDIT'" @click="handleSaveEdit"></v-btn>
    <v-btn v-else="$vuetify.display.lgAndUp" :loading="saving" :class="`!fixed bottom-20 right-5 z-20 ${editMode ? '!bg-zinc-100 !text-zinc-600' : '!bg-zinc-700 !text-lime-50'}`" :icon="editMode ? 'mdi-content-save' : 'mdi-pencil'" @click="handleSaveEdit"></v-btn>
    <div class="w-full">
      <div class="grid grid-cols-12">
        <v-form v-if="editMode" @submit.prevent="handleSaveEdit" class="flex justify-center col-span-4 lg:col-span-3 justify-self-center">
          <div class="relative w-fit h-fit aspect-square border-2 border-dashed border-zinc-300 rounded-full flex items-center justify-center cursor-pointer overflow-hidden">
            <v-hover v-slot="{ isHovering, props }">
              <!-- Image Preview -->
              <v-img
                v-if="imageUploaded"
                :src="userModel.picture"
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
        </v-form>
        <v-avatar v-else class="col-span-4 lg:col-span-3 justify-self-center !border !border-slate-400 !bg-zinc-300" icon="mdi-account" :image="sessionUser.picture" size="108"></v-avatar>
        <div class="col-span-8 lg:col-span-9 self-center flex flex-col ps-5">
          <v-form v-if="editMode" @submit.prevent="handleSaveEdit" class="w-fit">
            <v-text-field
              class="min-w-32 m-0"
              v-model="userModel.display_name"
              :placeholder="sessionUser.display_name || sessionUser.name"
              label="Display Name"
              variant="underlined"
            ></v-text-field>
          </v-form>
          <span v-else class="text-xl font-bold">{{ sessionUser.display_name || sessionUser.name }}</span>
          <v-form v-if="editMode" @submit.prevent="handleSaveEdit" class="w-fit">
            <v-text-field
              class="min-w-32 m-0"
              v-model="userModel.username"
              :placeholder="sessionUser.username"
              label="Username"
              variant="underlined"
            ></v-text-field>
          </v-form>
          <span v-else class="py-2">@{{ sessionUser.username }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lalng="ts"> 
  const { data, getSession } = useAuth();
  const sessionUser = computed(() => data.value?.user);
  const userModel = ref({
    display_name: `${sessionUser.value.display_name}`,
    username: `${sessionUser.value.username}`,
    picture: `${sessionUser.value.picture}`,
  });
  const imageUploaded = ref(false);

  const editMode = ref(false);
  const saving = ref(false);

  function handleImageChange(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        userModel.value.picture = e.target.result;
      };

      reader.readAsDataURL(file);
      imageUploaded.value = true;
    }
  }


  async function getImageURL() {
    const imageURL = await $fetch("/api/users/picture", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      }, 
      body: JSON.stringify({
        "userAuthId": `${sessionUser.value.sub}`,
        "userId": `${sessionUser.value._id}`,
        "newPicture": `${userModel.value.picture}`,
      })
    });
    return imageURL;
  }

  async function handleSaveEdit() {
    if (editMode.value) {
      saving.value = true;

      const edittedUser = {};

      for (let property in userModel.value) {
        if (userModel.value[property] != sessionUser.value[property]) {
          // Only make request if the picture value has changed
          if (property == "picture") {
            edittedUser[property] = await getImageURL();
          } else {
            edittedUser[property] = userModel.value[property];
            if (property == "username") {
              // If the username has changed, set current date as date of modification
              edittedUser.username_modified = new Date().toISOString();
            }
          }
        }
      }

      if (Object.keys(edittedUser).length > 0) {
      
        await $fetch(`/api/users/${sessionUser.value._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...edittedUser,
          }),
        });

      }

      await getSession(true);
      saving.value = false;
    }

    editMode.value = !editMode.value;
  }
</script>