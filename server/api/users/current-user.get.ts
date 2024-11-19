import { mongo } from "~/server";
import { clerkClient } from "vue-clerk/server";

export default defineEventHandler(async (event) => {
  const { userId } = event.context.auth;
  const clerkUser = await clerkClient(event).users.getUser(userId as string);

  if (!clerkUser) {
    // TODO: Properly handle this error
    console.error("Could not get a response from Clerk about the current user");
  }

  const dbUser = await mongo.findUserByEmail(clerkUser?.emailAddresses[0].emailAddress as string);

  return {
    ...clerkUser,
    ...dbUser
  }
})