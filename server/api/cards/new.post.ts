import { getMessage, mongo } from "~/server";
import buildCellArray from "~/server/utils/buildCellArray";
import getRandomPhrases from "~/server/utils/getRandomPhrases";

export default defineEventHandler(async (event) => {
  const { name, cells, creator } = await readBody(event);

  try {
    if (cells.length < 24) {
      const remainder = 24 - cells.length;

      const theEntry = await mongo.findEntry("general");

      const randomPhrases = getRandomPhrases(theEntry.phrases, remainder);
      cells.push(...randomPhrases);
    }
    cells.splice(Math.floor(cells.length / 2), 0, "Free");

    const card = {
      cells: buildCellArray(cells),
      created_at: new Date().toISOString(),
      creator,
      isDeleted: false,
      name,
      references: 1,
    };

    const newCard = await $fetch("/api/cards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        card: {
          ...card
        }
      })
    });

    setResponseStatus(event, 200)
    return newCard;
    
  } catch (error) {
    let message = getMessage(error);
    console.info("Create card %s failed because %s", name, message);
    setResponseStatus(event, 500, message);
  }
})
