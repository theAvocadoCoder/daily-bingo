import { getMessage } from "~/server";

export default defineEventHandler(async (event) => {
  const { auth0Domain, authClientId, authClientSecret } = useRuntimeConfig();
  const {userId, newPicture} = await readBody(event);

  try {
    // @ts-expect-error
    const { access_token, token_type } = await $fetch(`${auth0Domain}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: `{\
        "client_id":"${authClientId}",\
        "client_secret":"${authClientSecret}",\
        "audience":"${auth0Domain}/api/v2/",\
        "grant_type":"client_credentials"\
      }`,
    });

    await $fetch(`${auth0Domain}/api/v2/users/${userId}`, {
      method: "PATCH",
      headers: {
        Authorization: `${token_type} ${access_token}`,
        "Content-Type": "application/json",
      },
      body: `{"user_metadata": {"picture": "${newPicture}"}}`
    });

    console.info("Update user %s photo successful", userId);

  } catch (error) {
    console.error("Error patching user picture", error);
    const message = getMessage(error);
    setResponseStatus(event, 500, message);
  }
})