import User from "~/interfaces/User";
import { getMessage, mongo } from "~/server";

export default defineEventHandler(async (event) => {
  await mongo.connect();
  const body = await readBody(event);
  const { data, type } = body;

  const theEmail = data.email_addresses[0].email_address;

  try {
    let theUser = await mongo.findUserByEmail(theEmail);
    if (theUser === null) {
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

    } else {
      console.info("Get user %s completed", data.first_name);
    }

    setResponseStatus(event, 200)
    return theUser;
    
  } catch (error) {
    let message = getMessage(error);
    console.info("Could not find user %s because %s", theEmail, message);
    setResponseStatus(event, 500, message);
  }
});
