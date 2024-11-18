<template>
  <v-layout>
    <div class="relative h-full w-screen !overflow-hidden flex flex-col bg-zinc-300">

      <v-app-bar class="!fixed !top-0 !bg-stone-950 !text-stone-50 !px-3 lg:!px-5 !w-full [&>*:first-child]:!overflow-visible" prominent>
        
        <v-btn tag="nuxt-link" to="/groups" prepend-icon="mdi-arrow-left" class="!w-fit !h-fit !p-3">
          <v-avatar :image="gStore.group?.picture || sessionUser?.picture"></v-avatar>
        </v-btn>

        <v-app-bar-title @click="toggleDetails(true)" class="cursor-pointer">{{ groupName }}</v-app-bar-title>

        <div
          :class="`!h-screen w-screen lg:w-10/12 fixed -right-1 top-0 transition-transform ease-in-out ${
            showDetailsPanel ? 'translate-x-0 pointer-events-auto' : 'translate-x-[101%] opacity-0 pointer-events-none'
          }`"
        >
          <v-card class="h-full !bg-lime-600">
            <v-toolbar class="!bg-transparent !text-zinc-200">
              <v-btn icon="mdi-close" @click="toggleDetails(false)"></v-btn>
              <v-spacer></v-spacer>
            </v-toolbar>

            <NuxtPage />
          </v-card>
        </div>
      </v-app-bar>

      <main class="contents">
        <v-app class="!h-full !w-full !overflow-hidden py-5 xl:py-10 !bg-transparent overflow-y-auto">
          <!-- Messages -->
          <div ref="messagesContainer" class="mt-28 mb-20 w-full h-full !overflow-hidden max-w-5xl mx-auto">
            <span v-if="gStore.error">
              Error message
            </span>

            <!-- Message -->
            <template v-else-if="gStore.group" v-for="message in messages" :key="getId(message)">
              <div :class="`${getMessageStyle(message?.sender?.user_id)} mb-5 p-5 relative w-fit rounded-md`">
                <p v-if="message.sender?.user_id" class="font-bold text-xl">{{ message.sender.username }}</p>
                <p>{{ message.text }}</p>
              </div>
            </template>

            <Loading v-else />
          </div>

          <!-- Typing Area -->
          <div class="fixed bottom-0 w-full left-0 bg-stone-800 py-2">
            <v-form @submit.prevent="sendMessage" class="w-full mx-auto max-w-5xl flex justify-center items-center gap-5 lg:gap-10">
              <v-btn type="button" class="!bg-lime-500 !text-stone-700" icon="mdi-paperclip" />
              <v-text-field
                class="w-full [&_input]:!bg-white pb-0 bg-white"
                v-model="newMessage"
                placeholder="Message"
                :hide-details="true"
              />
              <v-btn :loading="sending" type="submit" class="!bg-lime-500 !text-stone-700" icon="mdi-send" />
            </v-form>
          </div>
        </v-app>
      </main>
    </div>
  </v-layout>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: "auth",
  auth: {
    guestRedirectUrl: "/sign-in"
  }
});

  import type { Message as AblyMessage } from "ably";
  import type Group from "~/interfaces/Group";
  import type { Message } from "~/interfaces/Group";
  import type User from "~/interfaces/User";
  import { useGroupStore } from "~/stores/groupStore";

  definePageMeta({
    layout: false
  })

  const { $storage } = useNuxtApp();

  const { data } = useAuth();
  const route = useRoute();
  const gStore = useGroupStore();
  const { scrollY } = useUpdateScroll();

  const groupId = route.params.id as unknown;

  const showDetailsPanel = ref(route.name?.toString().includes("details"));
  const messagesContainer = ref<HTMLDivElement>();

  const groupName = computed(() => gStore.group?.name);
  const sessionUser = computed(() => data.value?.user as User);

  const sending = ref(false);
  const newMessage = ref("");
  const messages = ref<Group['history'] | null>(null);
  const ably = ref();

  function scrollToBottom(preserve: boolean = false) {
    console.log("preserve", preserve,"scrollY", toValue(scrollY));
    messagesContainer.value!.scrollTop = preserve ? toValue(scrollY) : messagesContainer.value!.scrollHeight;
  }

  function toggleDetails(toOpen: boolean) {
    showDetailsPanel.value = toOpen;

    if (toOpen) {
      setTimeout(() => scrollToBottom, 50);
      navigateTo(`/groups/${groupId}/details`);
    } else {
      navigateTo(`/groups/${groupId}`);
    }
  }

  function getId(message: Message) {
    const randomFourDigits = Math.floor(Math.random() * 10000);
    return `${message.sender.user_id}-${message.text.slice(5)}-${randomFourDigits}`;
  }

  function getMessageStyle(id: string) {
    if (id === `${sessionUser.value._id}`) {
      // Session user message
      return `ownMessage bg-lime-700 text-zinc-200 border-lime-700 ml-auto mr-10 rounded-tr-none`;
    } else if (id === null) {
      // System message
      return `bg-zinc-400/50 mx-auto text-center w-full py-2`;
    } else {
      // Other user message
      return `otherMessage bg-stone-800 text-zinc-200 border-stone-800 mr-auto ml-10 rounded-tl-none`;
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
    
    const channel = ably.value?.channels.get(`group-${gStore.group?._id}`);

    // Publish message
    await channel.publish("message", messageData);
    // scrollToBottom();

    newMessage.value = "";
    sending.value = false;

    gStore.fetchGroup(`${groupId}`);
    $storage.setData("currentGroup", gStore.group);
  }

  onMounted(async () => {
    if (ably.value) return;

    const { $ably } = useNuxtApp();
    ably.value = await $ably(`${sessionUser.value?._id}` || sessionUser.value?.username);

    const channel = ably.value?.channels.get(`group-${gStore.group?._id}`);

    // Subscribe to the message event
    channel.subscribe('message', (message: AblyMessage) => {
      if (message.data === messages.value![messages.value!.length - 1]) return 
      messages.value?.push({
        ...message.data
      });
    });
  })

  onUnmounted(async () => {
    $storage.setData("currentGroup", null);

    ably.value?.connection.close();

    await ably.value?.connection.once("closed", function () {
      console.log("Closed the connection to Ably.")
    });
  })

  onMounted(async() => {
    await gStore.fetchGroup(`${groupId}`);
    messages.value = gStore.group?.history || null;

    // Scroll to bottom of chat
    // setTimeout(scrollToBottom, 0);
    console.log("path", route.path);
  })

  onUnmounted(() => {
    gStore.clearGroup();
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
