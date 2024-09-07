import { getMessage, mongo } from "~/server/index";

export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, "id") as string;

  try {
    const theUser = await mongo.findUser(userId);
    console.info("Get user %s completed", userId);
    setResponseStatus(event, 200)
    return theUser;

  } catch (error) {
    let message = getMessage(error);
    console.info("Get User %s failed because %s", userId, message);
    setResponseStatus(event, 500, message);
  }
})