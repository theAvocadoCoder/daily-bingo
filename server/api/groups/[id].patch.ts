import { getMessage, mongo } from "~/server";

export default defineEventHandler(async (event) => {
  const groupId = getRouterParam(event, "id") as string;
  const {group, operation} = await readBody(event);

  try {
    let theGroup;
    if (operation) {
      theGroup = await mongo.updateGroupReferences(groupId, operation);
      if (group) theGroup = await mongo.updateGroup(groupId, group);
    } else {
      theGroup = await mongo.updateGroup(groupId, group);
    }
    console.info("Update group %s successful", theGroup._id);
    setResponseStatus(event, 200);
    return theGroup;
  } catch (error) {
    const message = getMessage(error);
    console.info("Could not update group %s because %s", groupId, message);
    setResponseStatus(event, 500, message);
  }
})