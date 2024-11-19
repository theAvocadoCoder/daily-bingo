import { getMessage, mongo } from "~/server/index";

export default defineEventHandler(async (event) => {
  const cardId = getRouterParam(event, "id") as string;

  try {
    const theCard = await mongo.findCard(cardId);
    console.info("Get card %s completed", cardId);
    setResponseStatus(event, 200)
    return theCard;

  } catch (error) {
    let message = getMessage(error);
    console.info("Get card %s failed because %s", cardId, message);
    setResponseStatus(event, 500, message);
  }
})