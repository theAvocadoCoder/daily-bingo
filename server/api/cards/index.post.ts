import { getMessage, mongo } from "~/server";

export default defineEventHandler(async (event) => {
  await mongo.connect();
  const { card, cards } = await readBody(event);

  let newCard;
  if (card) {
    try {
      newCard = await mongo.insertCard(card);
      console.info("Create card %s successful", newCard._id);
      setResponseStatus(event, 200);
      return newCard;
    } catch (error) {
      const message = getMessage(error);
      console.info("Could not create %s's card because %s", card.creator.username, message);
      setResponseStatus(event, 500, message);
    }
  } else if (cards) {
    try {
      newCard = await mongo.findCards(cards);
      console.info("User's cards retrieved successfully");
      setResponseStatus(event, 200);
      return newCard;
    } catch (error) {
      const message = getMessage(error);
      console.info("Could not retrieve cards because %s", message);
      setResponseStatus(event, 500, message);
    }
  }
});