import { getMessage, mongo } from "~/server";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, name } = body;

  try {
    const theUser = await mongo.findUserByEmail(email);
    if (theUser === null) {
      const newUser = await mongo.insertUser({email, username: name});
      console.info("Create user %s completed", email);
      setResponseStatus(event, 200);
      return newUser;
    }
    console.info("Get user %s completed", email);
    setResponseStatus(event, 200)
    return theUser;
  } catch (error) {
    let message = getMessage(error);
    console.info("Could not find user %s because %s", email, message);
    setResponseStatus(event, 500, message);
  }
});
