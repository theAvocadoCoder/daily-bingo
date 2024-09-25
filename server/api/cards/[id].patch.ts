import { getMessage, mongo } from "~/server";

export default defineEventHandler(async (event) => {
  const cardId = getRouterParam(event, "id") as string;
  const card = await readBody(event);

  try {
    const theCard = await mongo.updateCard(cardId, card);
    console.info("Update card %s successful", theCard._id);
    setResponseStatus(event, 200);
    return theCard;
  } catch (error) {
    const message = getMessage(error);
    console.info("Could not update card %s because %s", cardId, message);
    setResponseStatus(event, 500, message);
  }
})