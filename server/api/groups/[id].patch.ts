import { getMessage, mongo } from "~/server";
import Group, {Message}  from "~/interfaces/Group";

type OperationType = "messages-insert" | "members-insert";

interface BodyObject {
  group: Partial<Group>,
  messages: Partial<Message>[],
  operation: OperationType,
  references: 1 | -1,
}

export default defineEventHandler(async (event) => {
  const groupId = getRouterParam(event, "id") as string;
  const {group, messages, operation, references}: BodyObject = await readBody(event);

  try {
    let theGroup;
    if (typeof references === "number") {
      theGroup = await mongo.updateGroupReferences(groupId, references);
      if (group) theGroup = await mongo.updateGroup(groupId, group);
    } else if (operation?.includes("messages")) {
      if (operation?.includes("insert")) {
        theGroup = await mongo.insertGroupMessages(groupId, messages)
      } else if (operation?.includes("update")) {
        // TODO: Edit a message in the group history
        theGroup = await mongo.updateGroup(groupId, group)
      } else if (operation?.includes("delete")) {
        // TODO: Delete a message from the group history
        theGroup = await mongo.updateGroup(groupId, group)
      }
      else {
        throw new Error("Invalid history operator")
      }
    } else if (operation?.includes("members")) {
      if (operation?.includes("insert")) {
        // TODO: Add a member to the group
        theGroup = await mongo.updateGroup(groupId, group)
      } else if (operation?.includes("update")) {
        // TODO: Edit a member in the group
        theGroup = await mongo.updateGroup(groupId, group)
      } else if (operation?.includes("delete")) {
        // TODO: Delete a member from the group
        theGroup = await mongo.updateGroup(groupId, group)
      } else {
        throw new Error("Invalid members operator")
      }
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