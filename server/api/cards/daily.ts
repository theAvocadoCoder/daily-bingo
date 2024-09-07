import { getMessage, mongo } from "~/server";
import { ObjectId } from "mongodb";
import buildCellArray from "~/server/utils/buildCellArray";
import getRandomPhrases from "~/server/utils/getRandomPhrases";
import Card from "~/server/interfaces/Card";

export default defineEventHandler(async (event) => {

  try {
    const theEntry = await mongo.findEntry("general");
    console.info("Get entry general completed");

    const cells = buildCellArray(getRandomPhrases(theEntry.phrases, 25));

    const card = await mongo.insertCard({
      cells,
      createdAt: new Date(),
      creator: new ObjectId(process.env.DEFAULT_USER as string),
      groups: [],
    }) as Card

    setResponseStatus(event, 200)
    return card;
    
  } catch (error) {
    let message = getMessage(error);
    console.info("Get entry general failed because %s", message);
    setResponseStatus(event, 500, message);
  }
})
