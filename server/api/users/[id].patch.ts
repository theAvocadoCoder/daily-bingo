import { getMessage, mongo } from "~/server";

export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, "id") as string;
  const {data, operation} = await readBody(event);

  try {
    let theUser;
    if (operation?.includes("cards")) {
      if (operation?.includes("insert")) {
        theUser = await mongo.insertUserCard(userId, data);
      } else if (operation?.includes("update")) {
        theUser = await mongo.updateUserCard(userId, data.card, data.marked);
      } else if (operation?.includes("delete")) {
        theUser = await mongo.deleteUserCard(userId, data);
      }
    } else if (operation?.includes("groups")) {
      if (operation?.includes("insert")) {
        theUser = await mongo.insertUserGroup(userId, data);
      } else if (operation?.includes("update")) {
        // for (let fieldItem of Object.keys(data)) {
        //   theUser = await mongo.updateUserGroup(userId, {[fieldItem]: data[fieldItem]});
        // }
      } else if (operation?.includes("delete")) {
        theUser = await mongo.deleteUserGroup(userId, data);
      }
    } else {
      for (let fieldItem of Object.keys(data)) {
        theUser = await mongo.updateUser(userId, {[fieldItem]: data[fieldItem]});
      }
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