<template>
  <div class="bg-zinc-200 h-full flex flex-col gap-5 relative">
    <v-btn class="" icon="mdi-arrow-left" variant="text" @click="$router.back()"></v-btn>
    <v-btn v-if="$vuetify.display.lgAndUp" :loading="saving" :class="`!fixed bottom-20 right-5 z-20 ${editMode ? '!bg-zinc-100 !text-zinc-600' : '!bg-zinc-700 !text-lime-50'}`" :append-icon="editMode ? 'mdi-content-save' : 'mdi-pencil'" :text="editMode ? 'SAVE' : 'EDIT'" @click="handleSaveEdit"></v-btn>
    <v-btn v-else="$vuetify.display.lgAndUp" :loading="saving" :class="`!fixed bottom-20 right-5 z-20 ${editMode ? '!bg-zinc-100 !text-zinc-600' : '!bg-zinc-700 !text-lime-50'}`" :icon="editMode ? 'mdi-content-save' : 'mdi-pencil'" @click="handleSaveEdit"></v-btn>
    <div class="w-full">
      <div class="grid grid-cols-12">
        <v-avatar class="col-span-4 lg:col-span-3 justify-self-center !border !border-slate-400 !bg-zinc-300" icon="mdi-account" :image="user.picture" size="108"></v-avatar>
        <div class="col-span-8 lg:col-span-9 self-center flex flex-col ps-5">
          
          <v-form v-if="editMode" @submit.prevent="handleSaveEdit" class="w-fit">
            <v-text-field
              class="min-w-32 m-0"
              v-model="edittedUser.display_name"
              :placeholder="user.display_name || user.name"
              label="Display Name"
              variant="underlined"
            ></v-text-field>
          </v-form>
          <span v-else class="text-xl font-bold">{{ user.display_name || user.name }}</span>
          <span class="py-2">@{{ user.username }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lalng="ts"> 
  const { data, getSession } = useAuth();
  const user = computed(() => data.value?.user);
  const edittedUser = ref({display_name: ''});

  const editMode = ref(false);
  const saving = ref(false);

  async function handleSaveEdit() {
    if (editMode.value) {
      saving.value = true;
      const results = await $fetch(`/api/users/${user.value._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          display_name: edittedUser.value.display_name,
        }),
      });
      await getSession(true);
      saving.value = false;
    }
    editMode.value = !editMode.value;
  }
</script>