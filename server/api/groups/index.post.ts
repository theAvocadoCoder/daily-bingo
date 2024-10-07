import { getMessage, mongo } from "~/server";

export default defineEventHandler(async (event) => {
  const { group, groups } = await readBody(event);

  let newGroup;
  if (group) {
    try {
      newGroup = await mongo.insertGroup(group);
      console.info("Create group %s successful", newGroup._id);
      setResponseStatus(event, 200);
      return newGroup;
    } catch (error) {
      const message = getMessage(error);
      console.info("Could not create %s's group because %s", group.creator.username, message);
      setResponseStatus(event, 500, message);
    }
  } else if (groups) {
    try {
      newGroup = await mongo.findGroups(groups);
      console.info("User's groups retrieved successfully");
      setResponseStatus(event, 200);
      return newGroup;
    } catch (error) {
      const message = getMessage(error);
      console.info("Could not retrieve group because %s", message);
      setResponseStatus(event, 500, message);
    }
  }
});