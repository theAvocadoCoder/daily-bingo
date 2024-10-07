<template>
  <div class="relative h-full flex flex-col bg-zinc-300">
    <v-app-bar
      class="!fixed !top-0 !bg-stone-950 !text-stone-50 !px-5 !w-full [&>*:first-child]:!overflow-visible"
      prominent
    >
      <v-btn tag="nuxt-link" to="/groups" prepend-icon="mdi-arrow-left" class="!w-fit !h-fit !p-3">
        <v-avatar :image="group?.picture || sessionUser?.picture"></v-avatar>
      </v-btn>

      <v-app-bar-title>
        {{ group?.name }}
      </v-app-bar-title>

      <v-spacer></v-spacer>
    </v-app-bar>

    <main class="contents">
      <v-app class="!h-full py-5 xl:py-10 !bg-transparent">
        <!-- Messages -->
        <div class="mt-28 mb-20">
          <!-- Message -->
          <div v-for="message in group?.history" :class="`${getMessageStyle(message?.sender?.user_id)} mb-5`">
            <p v-if="message.sender?.user_id" class="font-bold text-xl">{{ message.sender.username }}</p>
            <p>{{ message.message }}</p>
          </div>
        </div>

        <!-- Typing Area -->
        <div class="fixed bottom-0 w-full left-0 bg-stone-800 py-2">
          <v-form @submit.prevent="sendMessage" class="w-full mx-auto max-w-5xl flex justify-center items-center gap-5 lg:gap-10">
            <v-text-field
            class="w-full [&_input]:!bg-white pb-0 bg-white"
            v-model="newMessage"
            placeholder="Message"
            hide-details="true"
            />
            <v-btn :loading="sending" type="submit" class="!bg-lime-500" icon="mdi-send" />
          </v-form>
        </div>
      </v-app>
    </main>
  </div>
</template>

<script setup lang="ts">
  import type User from "~/interfaces/User";
  const { getData, setData } = useNuxtApp().$locally;
  const route = useRoute();
  const { data, getSession } = useAuth();
  const newMessage = ref("");
  const sending = ref(false);

  definePageMeta({
    layout: "chat"
  })

  const group = ref(getData("currentGroup"));
  const groupStatus = ref<string>(group.value ? "" : "pending");

  const groupId = route.params.id as unknown;

  const groupName = computed(() => group.value.name);
  const sessionUser = computed(() => data.value?.user as User);

  if (!group.value) {
    group.value = await $fetch(`/api/groups/${groupId}`);
    groupStatus.value = "";
    setData("currentGroup", group.value, false);
  }

  // Scroll to bottom of chat
  setTimeout(() => {
    window.scrollTo(0, document.documentElement.scrollHeight);
  }, 50);

  function getMessageStyle(id) {
    if (id === sessionUser.value._id) {
      // Session user message
      return `ownMessage relative bg-lime-700 border-lime-700 text-zinc-200 w-fit px-4 ml-auto mr-10 rounded-md rounded-tr-none`;
    } else if (id === null) {
      // System message
      return `bg-zinc-400/50 mx-auto text-center w-screen py-2`;
    } else {
      // Other user message
      return `otherMessage relative bg-stone-800 border-stone-800 text-zinc-200 w-fit px-4 mr-auto ml-10 rounded-md rounded-tl-none`;
    }
  }

  async function sendMessage() {
    if (newMessage.value?.trim() === '') return
    sending.value = true;
    await $fetch(`/api/groups/${group.value?._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        group: {
          history: [
            ...group.value?.history,
            {
              message: newMessage.value,
              sender: {
                user_id: sessionUser.value?._id,
                username: sessionUser.value?.username,
              }
            }
          ],
        }
      })
    });
    newMessage.value = "";
    sending.value = false;
    group.value = await $fetch(`/api/groups/${groupId}`);
    setData("currentGroup", group.value, false);
  }

  onUnmounted(() => {
    setData("currentGroup", null, false);
  });
  
</script>

<style scoped>
  .ownMessage {
    &::after {
      border-color: inherit;
      content: "";
      position: absolute;
      margin: 0;
      padding: 0;
      border-radius: 0;
      border-width: 6px;
      border-style: solid;
      border-right-color: transparent;
      border-bottom-color: transparent;
      right: -11px;
      top: 0px;
      width: 0px;
      height: 0px;
    }
  }
  .otherMessage {
    &::before {
      border-color: inherit;
      content: "";
      position: absolute;
      margin: 0;
      padding: 0;
      border-radius: 0;
      border-width: 6px;
      border-style: solid;
      border-left-color: transparent;
      border-bottom-color: transparent;
      left: -11px;
      top: 0px;
      width: 0px;
      height: 0px;
    }
  }
</style>
