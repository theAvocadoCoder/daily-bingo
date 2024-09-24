import { getMessage, mongo } from "~/server";

export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, "id") as string;
  const body = await readBody(event);

  try {
    let theUser;
    if (Object.keys(body).includes("card")) {
      const [newBody, query] = Object.entries(body);
      // @ts-expect-error
      theUser = await mongo.updateUser(userId, newBody, query);
    } else {
      theUser = await mongo.updateUser(userId, body);
    }
    console.info("Update user %s completed", userId);
    setResponseStatus(event, 200)
    return theUser;

  } catch (error) {
    let message = getMessage(error);
    console.info("Update User %s failed because %s", userId, message);
    setResponseStatus(event, 500, message);
  }
})