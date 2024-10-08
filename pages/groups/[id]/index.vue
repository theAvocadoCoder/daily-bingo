<template>
  <div class="relative h-full w-screen flex flex-col bg-zinc-300">
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
      <v-app class="!h-full !w-full py-5 xl:py-10 !bg-transparent">
        <!-- Messages -->
        <div class="mt-28 mb-20 w-full h-full">
          <span v-if="!group">
            <Loading />
          </span>

          <!-- Message -->
          <div v-else v-for="message in messages" :key="message.id" :class="`${getMessageStyle(message?.sender?.user_id)} mb-5`">
            <p v-if="message.sender?.user_id" class="font-bold text-xl">{{ message.sender.username }}</p>
            <p>{{ message.text }}</p>
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

  definePageMeta({
    layout: "chat"
  })

  const { getData, setData } = useNuxtApp().$locally;

  const { data, getSession } = useAuth();
  const route = useRoute();

  const groupId = route.params.id as unknown;

  const group = ref(await $fetch(`/api/groups/${groupId}`));
  const groupName = computed(() => group.value?.name);
  const sessionUser = computed(() => data.value?.user as User);

  setData("currentGroup", group.value, false);

  const sending = ref(false);
  const newMessage = ref("");
  const messages = ref(group.value?.history);
  const ably = ref();

  // Scroll to bottom of chat
  setTimeout(scrollToBottom, 50);

  function scrollToBottom() {
    window.scrollTo(0, document.documentElement.scrollHeight);
  }

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

    const messageData = {
      text: newMessage.value?.trim(),
      sender: {
        user_id: sessionUser.value?._id,
        username: sessionUser.value?.username,
      },
      attached: []
    };
    
    const channel = ably.value?.channels.get(`group-${group.value?._id}`);

    // Publish message
    await channel.publish("message", messageData);
    scrollToBottom();

    newMessage.value = "";
    sending.value = false;

    group.value = await $fetch(`/api/groups/${groupId}`);
    setData("currentGroup", group.value, false);
  }

  onMounted(async () => {
    if (ably.value) return;

    const { $ably } = useNuxtApp();
    ably.value = await $ably(sessionUser.value?._id);

    const channel = ably.value?.channels.get(`group-${group.value?._id}`);

    // Subscribe to the message event
    channel.subscribe('message', (message) => {
      if (message.data === messages.value[messages.value.length - 1]) return 
      messages.value?.push({
        ...message.data
      });
    });
  })

  onUnmounted(async () => {
    setData("currentGroup", null, false);

    ably.value?.connection.close();

    await ably.value?.connection.once("closed", function () {
      console.log("Closed the connection to Ably.")
    });
  })
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
