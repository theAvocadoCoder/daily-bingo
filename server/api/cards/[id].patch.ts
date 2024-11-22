import { getMessage, mongo } from "~/server";
import type User from "~/interfaces/User";

export default defineEventHandler(async (event) => {
  const cardId = getRouterParam(event, "id") as string;
  const {card, operation, userId} = await readBody(event);

  try {
    let theCard;
    if (operation) {
      theCard = await mongo.updateCardReferences(cardId, operation);
      if (card) theCard = await mongo.updateCard(cardId, card);
      await $fetch<User>(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: theCard._id,
          operation: "cards-delete",
        }),
      });
    } else {
      theCard = await mongo.updateCard(cardId, card);
    }
    console.info("Update card %s successful", theCard._id);
    setResponseStatus(event, 200);
    return theCard;
  } catch (error) {
    const message = getMessage(error);
    console.info("Could not update card %s because %s", cardId, message);
    setResponseStatus(event, 500, message);
  }
})