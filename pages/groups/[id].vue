<template>
  <div class="h-fit relative" v-if="!isLoaded">
    <Loading />
  </div>
  <div class="h-fit relative flex justify-center" v-else-if="!isSignedIn">
    <v-btn tag="nuxt-link" to="sign/in">Sign in to view this page</v-btn>
  </div>
  <v-layout v-else>
    <div class="relative h-full w-screen !overflow-hidden flex flex-col bg-zinc-300">

      <v-app-bar class="!fixed !top-0 !bg-stone-950 !text-stone-50 !px-3 lg:!px-5 !w-full [&>*:first-child]:!overflow-visible" prominent>
        
        <v-btn tag="nuxt-link" to="/groups" prepend-icon="mdi-arrow-left" class="!w-fit !h-fit !p-3">
          <v-avatar :image="toValue(group)?.picture || sessionUser?.picture"></v-avatar>
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
            <span v-if="error">
              Error message: {{ error }}
            </span>

            <!-- Message -->
            <template v-else-if="group && groupsMessages">
              <template v-for="message in groupsMessages[groupId]?.messages" :key="message.id">
                <div v-if="message.id && message.id === groupsMessages[groupId].lastReadId" :class="getMessageStyle(null)">New Messages</div>
                <div :class="`${getMessageStyle(message?.sender?.user_id)} mb-5 p-5 relative w-fit rounded-md`">
                  <p v-if="message.sender?.user_id" class="font-bold text-xl">{{ message.sender.username }}</p>
                  <p>{{ message.text }}</p>
                </div>
              </template>
              <div ref="chatBottom"></div>
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

  import type User from "~/interfaces/User";
  import { useGroupStore } from "~/stores/groupStore";
  import { useGlobalStore } from "~/stores/globalStore";
  import { useAblyStore } from "~/stores/ablyStore";
  import { storeToRefs } from "pinia";

  definePageMeta({
    layout: false
  })

  const { $lstorage, $sStorage, $toast } = useNuxtApp();
  const { isLoaded, isSignedIn } = useAuth();
  const route = useRoute();

  const gStore = useGroupStore();
  const store = useGlobalStore();
  const ablyStore = useAblyStore();

  const { error, group } = storeToRefs(gStore);
  const { clearGroup, fetchGroup } = gStore;
  const { preservedY } = storeToRefs(store);
  const { preserveScrollPosition } = store;
  const { newMessage: pubSubMessage } = storeToRefs(ablyStore);
  const { publishMessage, setStorageData } = ablyStore;

  const groupId = route.params.id as unknown as string;

  const showDetailsPanel = ref(route.name?.toString().includes("details"));
  const messagesContainer = ref<HTMLDivElement>();
  const chatBottom = ref<HTMLDivElement>();

  const groupName = computed(() => toValue(group)?.name);
  const sessionUser = ref($lstorage.getData("bingoUser"));
  const groupsMessages = ref($lstorage.getData("groupsMessages"));

  watch(
    [
      () => messagesContainer.value, 
      () => pubSubMessage.value
    ], 
    () => {
      groupsMessages.value = $lstorage.getData("groupsMessages");
      scrollToCurrent();
    }
  )

  const sending = ref(false);
  const newMessage = ref("");

  function scrollToCurrent(preserve: boolean = false) {
    
    if (preserve) {
      messagesContainer.value?.scrollTo({
        top: toValue(preservedY),
        behavior: "smooth",
      });
    } else {
      chatBottom.value?.scrollIntoView({
        behavior: "smooth"
      });
    }

  }

  function toggleDetails(toOpen: boolean) {
    showDetailsPanel.value = toOpen;

    if (toOpen) {
      preserveScrollPosition();
      navigateTo(`/groups/${groupId}/details`);
    } else {
      navigateTo(`/groups/${groupId}`);
    }
  }

  function getMessageStyle(id: string | null) {
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

    publishMessage(newMessage.value?.trim(), []);

    newMessage.value = "";
    sending.value = false;
  }

  onMounted(async() => {
    setStorageData();
    await fetchGroup(`${groupId}`)
    .then(() => {  
      let newValue;
      if (groupsMessages.value) newValue = {...groupsMessages.value[groupId]};
  
      newValue.messages = [...(toValue(group)?.history!)];
  
      $lstorage.setData(
        "groupsMessages", 
        {...groupsMessages.value, [groupId]: newValue}
      );
    })
    .then(() => scrollToCurrent());
  })

  onUnmounted(() => {
    clearGroup();
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
