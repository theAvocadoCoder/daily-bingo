import { getMessage, mongo } from "~/server";

export default defineEventHandler(async (event) => {
  await mongo.connect();
  const cardId = getRouterParam(event, "id") as string;
  const {card, operation} = await readBody(event);

  try {
    let theCard;
    if (operation) {
      theCard = await mongo.updateCardReferences(cardId, operation);
      if (card) theCard = await mongo.updateCard(cardId, card);
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