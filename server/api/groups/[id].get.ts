import { getMessage, mongo } from "~/server/index";

export default defineEventHandler(async (event) => {
  await mongo.connect();
  const groupId = getRouterParam(event, "id") as string;

  try {
    const theGroup = await mongo.findGroup(groupId);
    console.info("Get group %s completed", groupId);
    setResponseStatus(event, 200)
    return theGroup;

  } catch (error) {
    let message = getMessage(error);
    console.info("Get group %s failed because %s", groupId, message);
    setResponseStatus(event, 500, message);
  }
})