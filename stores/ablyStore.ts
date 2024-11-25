// stores/ablyStore.ts
import { defineStore, acceptHMRUpdate } from "pinia";
import type { Message as AblyMessage } from "ably";
import { UUID } from "uuidjs";

interface groupMessage {
  text: string,
  sender: {
    user_id: string,
    username: string,
  },
  attached: string[],
  timeStamp: string,
  id: string,
}
type userGroups = Record< string, {lastReadId: string, messages: groupMessage[]} >

export const useAblyStore = defineStore("ably", () => {
  const { $ably, $lstorage, $sStorage, $toast } = useNuxtApp();

  const sessionUser = computed(() => $lstorage.getData("bingoUser"));
  const groupsMessages = computed(() => $lstorage.getData("groupsMessages") as userGroups);

  const ably = ref();
  const newMessage = ref();

  function setStorageData() {
    if (!groupsMessages.value) {
      const userGroups: userGroups = {}
      sessionUser.value.groups?.map((group: string) => userGroups[group] = {lastReadId: "", messages: []});
      $lstorage.setData("groupsMessages", userGroups);
    }
  }

  async function connectAbly() {
    if (ably.value) return;
    ably.value = await $ably(`${sessionUser.value?._id}`);
  }

  async function subscribeToUserGroups() {
    if (!groupsMessages.value || !Object.keys(groupsMessages.value).length) return setStorageData();

    await connectAbly();
    const groupIds = sessionUser.value.groups;
    for (let i = 0; i < groupIds.length; i++) {
      const channel = ably.value?.channels.get(`group-${groupIds[i]}`);
      const thisGroup = groupsMessages.value[groupIds[i]];

      // Subscribe to the message event
      channel.subscribe("message", (message: AblyMessage) => {
        if (message.data.id === thisGroup.messages.slice(-1)[0].id) return 
        thisGroup.messages?.push({
          ...message.data
        });
        $lstorage.setData("groupsMessages", {...groupsMessages.value, [groupIds[i]]: thisGroup});
        newMessage.value = message.data;
        if (message.data.sender.username !== sessionUser.value.username) {
          $toast.info(`${message.data.sender.username}: ${message.data.text}`);
        }
      });
    }
  }

  async function publishMessage(message: string, attached: string[]) {
    connectAbly();
    const messageData: groupMessage = {
      text: message.trim(),
      sender: {
        user_id: sessionUser.value?._id,
        username: sessionUser.value?.username,
      },
      attached: [...attached],
      timeStamp: new Date().toISOString(),
      id: UUID.generate(),
    }
    const channel = ably.value?.channels.get(`group-${$sStorage.getData("currentGroup")._id}`);

    // Publish message
    await channel.publish("message", messageData);
    newMessage.value = messageData;
  }

  async function disconnectAbly() {
    ably.value?.connection.close();

    await ably.value?.connection.once("closed", function () {
      console.log("Closed the connection to Ably.")
    });
  }

  return { ably, newMessage, setStorageData, subscribeToUserGroups, publishMessage, disconnectAbly };
  
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAblyStore, import.meta.hot));
}
