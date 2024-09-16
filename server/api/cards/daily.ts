import { getMessage, mongo } from "~/server";
import buildCellArray from "~/server/utils/buildCellArray";
import getRandomPhrases from "~/server/utils/getRandomPhrases";

export default defineEventHandler(async (event) => {

  try {
    const theEntry = await mongo.findEntry("general");
    console.info("Get entry general completed");

    const cells = buildCellArray(getRandomPhrases(theEntry.phrases, 25));

    setResponseStatus(event, 200)
    return cells;
    
  } catch (error) {
    let message = getMessage(error);
    console.info("Get entry general failed because %s", message);
    setResponseStatus(event, 500, message);
  }
})
