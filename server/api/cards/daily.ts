import { getMessage, mongo } from "~/server";
import buildCellArray from "~/server/utils/buildCellArray";
import getRandomPhrases from "~/server/utils/getRandomPhrases";

export default defineEventHandler(async (event) => {
  await mongo.connect();

  try {
    const theEntry = await mongo.findEntry("general");
    console.info("Get entry general completed");

    const randomPhrases = getRandomPhrases(theEntry.phrases, 24);
    randomPhrases.splice(Math.floor(randomPhrases.length / 2), 0, "Free");

    const card = {
      cells: buildCellArray(randomPhrases),
      created_at: new Date().toISOString(),
      creator: {
        user_id: null,
        username: "Daily Bingo",
      },
      name: "Daily Card"
    }

    setResponseStatus(event, 200)
    return card;
    
  } catch (error) {
    let message = getMessage(error);
    console.info("Get entry general failed because %s", message);
    setResponseStatus(event, 500, message);
  }
})
