import { getMessage } from "~/server/index";
import Ably from "ably";

export default defineEventHandler(async (event) => {
  const { channel: channelName, messages: encodedMessages } = await readBody(event);
  const groupId = channelName.split("-")[1];

  const decodedMessages = await Ably.Realtime.Message.fromEncodedArray(encodedMessages);
  const messages = decodedMessages.map((message: any) => (message.data));

  try {
    const updatedGroup = await $fetch(`/api/groups/${groupId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
        operation: "messages-insert"
      }),
    })

    setResponseStatus(event, 200, "Successfully updated group history");
    return updatedGroup;

  } catch (error) {
    let message = getMessage(error);
    console.info("Update Group History failed because %s", message);
    setResponseStatus(event, 500, message);
  }
})