import User from "~/interfaces/User";
import { getMessage, mongo } from "~/server";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { data, type } = body;

  const theEmail = type === "user.created" ? data.email_addresses[0].email_address : "";

  try {
    let theUser = 
      type === "user.created" ? 
        await mongo.findUserByEmail(theEmail) : 
      type === "session.created" ?
        await mongo.findUserByClerkId(data.user_id) :
        undefined;

    if (theUser === null) {
      // The newly registered or signed in user is not yet in the db
      const userDetails: Partial<User> = {
        cards: [],
        clerk_id: data.id,
        display_name: `${data.first_name} ${data.last_name}`,
        email: theEmail,
        groups: [],
        picture: data.profile_image_url || data.image_url,
        username: data.username,
      }
      theUser = await mongo.insertUser(userDetails);
      console.info("Create user %s completed", theEmail);
    } else if (theUser) {
      console.info("Get user %s completed", data.first_name);
    } else if (theUser === undefined) {
      throw new Error("Invalid Clerk event type")
    }

    setResponseStatus(event, 200)
    return theUser;
    
  } catch (error) {
    let message = getMessage(error);
    console.info("Could not find user %s because %s", theEmail, message);
    setResponseStatus(event, 500, message);
  }
});
