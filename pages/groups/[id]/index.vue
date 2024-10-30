<template>
  <div class="relative h-full w-screen flex flex-col bg-zinc-300">
    <v-app-bar
      class="!fixed !top-0 !bg-stone-950 !text-stone-50 !px-5 !w-full [&>*:first-child]:!overflow-visible"
      prominent
    >
      <v-btn tag="nuxt-link" to="/groups" prepend-icon="mdi-arrow-left" class="!w-fit !h-fit !p-3">
        <v-avatar :image="group?.picture || sessionUser?.picture"></v-avatar>
      </v-btn>

      <v-app-bar-title @click="groupDetailsDialog = true">
        {{ groupName }}
      </v-app-bar-title>

      <v-dialog
        v-model="groupDetailsDialog"
        transition="dialog-top-transition"
        fullscreen
      >
        <!-- <template v-slot:activator="{ props: activatorProps }">
          <v-btn
            prepend-icon="mdi-cog"
            size="small"
            text="Settings"
            v-bind="activatorProps"
          ></v-btn>
        </template> -->

        <v-card>
          <v-toolbar>
            <v-btn
              icon="mdi-close"
              @click="groupDetailsDialog = false"
            ></v-btn>

            <v-toolbar-title>{{ groupName }}</v-toolbar-title>

            <v-spacer></v-spacer>

            <v-toolbar-items>
              <v-btn
                text="Save"
                variant="text"
                @click="groupDetailsDialog = false"
              ></v-btn>
            </v-toolbar-items>
          </v-toolbar>

          <v-list
            lines="two"
            subheader
          >
            <v-list-subheader>User Controls</v-list-subheader>

            <v-list-item
              subtitle="Set the content filtering level to restrict apps that can be downloaded"
              title="Content filtering"
              link
            ></v-list-item>

            <v-list-item
              subtitle="Require password for purchase or use password to restrict purchase"
              title="Password"
              link
            ></v-list-item>

            <v-divider></v-divider>

            <v-list-subheader>General</v-list-subheader>

            <v-list-item
              subtitle="Notify me about updates to apps or games that I downloaded"
              title="Notifications"
            >
            </v-list-item>

            <v-list-item
              subtitle="Auto-update apps at any time. Data charges may apply"
              title="Sound"
            >
            </v-list-item>

            <v-list-item
              subtitle="Automatically add home screen widgets"
              title="Auto-add widgets"
            >
            </v-list-item>
          </v-list>
        </v-card>
      </v-dialog>

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
          <div v-else v-for="message in messages" :key="getId(message)" :class="`${getMessageStyle(message?.sender?.user_id)} mb-5`">
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
              :hide-details="true"
            />
            <v-btn :loading="sending" type="submit" class="!bg-lime-500" icon="mdi-send" />
          </v-form>
        </div>
      </v-app>
    </main>
  </div>
</template>

<script setup lang="ts">
  import type { Message as AblyMessage } from "ably";
  import type Group from "~/interfaces/Group";
  import type { Message } from "~/interfaces/Group";
  import type User from "~/interfaces/User";

  definePageMeta({
    layout: "chat"
  })

  const { $storage } = useNuxtApp();

  const { data } = useAuth();
  const route = useRoute();

  const groupId = route.params.id as unknown;

  const groupDetailsDialog = ref(false);

  const group = ref<Group>();
  group.value = await $fetch<Group>(`/api/groups/${groupId}`);

  const groupName = computed(() => group.value?.name);
  const sessionUser = computed(() => data.value?.user as User);

  $storage.setData("currentGroup", group.value, false);

  const sending = ref(false);
  const newMessage = ref("");
  const messages = ref(group.value?.history);
  const ably = ref();

  // Scroll to bottom of chat
  setTimeout(scrollToBottom, 50);

  function scrollToBottom() {
    window.scrollTo(0, document.documentElement.scrollHeight);
  }

  function getId(message: Message) {
    const randomFourDigits = Math.floor(Math.random() * 10000);
    return `${message.sender.user_id}-${message.text.slice(5)}-${randomFourDigits}`;
  }

  function getMessageStyle(id: string) {
    if (id === `${sessionUser.value._id}`) {
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

    group.value = await $fetch<Group>(`/api/groups/${groupId}`);
    $storage.setData("currentGroup", group.value, false);
  }

  onMounted(async () => {
    if (ably.value) return;

    const { $ably } = useNuxtApp();
    ably.value = await $ably(`${sessionUser.value?._id}` || sessionUser.value?.username);

    const channel = ably.value?.channels.get(`group-${group.value?._id}`);

    // Subscribe to the message event
    channel.subscribe('message', (message: AblyMessage) => {
      if (message.data === messages.value[messages.value.length - 1]) return 
      messages.value?.push({
        ...message.data
      });
    });
  })

  onUnmounted(async () => {
    $storage.setData("currentGroup", null, false);

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
