import { cloudinary, getMessage } from "~/server";

export default defineEventHandler(async (event) => {
  const { auth0Domain, authClientId, authClientSecret } = useRuntimeConfig();
  const {userAuthId, userId, newPicture} = await readBody(event);

  const imageURL = await cloudinary.uploader.upload(newPicture, {
      public_id: `${userId}`,
      overwrite: true,
      unique_filename: false,
    })
    .catch(error => {
      console.error("Error uploading picture to Cloudinary", error);
      const message = getMessage(error);
      setResponseStatus(event, 500, message);
    })
    .then(async results => {
      if (results) {
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

        await $fetch(`${auth0Domain}/api/v2/users/${userAuthId}`, {
          method: "PATCH",
          headers: {
            Authorization: `${token_type} ${access_token}`,
            "Content-Type": "application/json",
          },
          body: `{"user_metadata": {"picture": "${results.secure_url}"}}`
        });

        console.info("Update user %s photo successful", userAuthId);
        return results.secure_url;
      }
    })
    .catch (error => {
      console.error("Error updating picture", error);
      const message = getMessage(error);
      setResponseStatus(event, 500, message);
    });

    setResponseStatus(event, 200);
    return imageURL;
})