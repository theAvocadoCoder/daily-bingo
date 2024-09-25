import { getMessage, mongo } from "~/server";

export default defineEventHandler(async (event) => {
  const card = await readBody(event);

  try {
    const newCard = await mongo.insertCard(card);
    console.info("Create card %s successful", newCard._id);
    setResponseStatus(event, 200);
    return newCard;
  } catch (error) {
    const message = getMessage(error);
    console.info("Could not create %s's card because %s", card.creator.username, message);
    setResponseStatus(event, 500, message);
  }
})