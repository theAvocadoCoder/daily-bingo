import User from "~/interfaces/User";
import { getMessage, mongo } from "~/server";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { data, type } = body;

  const theEmail = data.email_addresses[0].email_address;

  try {
    let theUser = await mongo.findUserByEmail(theEmail);
    if (theUser === null) {
      const userDetails: Partial<User> = {
        cards: [],
        clerk_id: body.id,
        display_name: `${body.first_name} ${body.last_name}`,
        email: theEmail,
        groups: [],
        username: body.username,
      }
      theUser = await mongo.insertUser(userDetails);
      console.info("Create user %s completed", theEmail);
    } else {
      console.info("Get user %s completed", body.first_name);
    }

    theUser = await $fetch("/api/users/picture", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: theUser._id,
        newPicture: data.profile_image_url || data.image_url,
      })
    })

    setResponseStatus(event, 200)
    return theUser;
    
  } catch (error) {
    let message = getMessage(error);
    console.info("Could not find user %s because %s", theEmail, message);
    setResponseStatus(event, 500, message);
  }
});
