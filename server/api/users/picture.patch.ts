import { cloudinary, getMessage, mongo } from "~/server";

export default defineEventHandler(async (event) => {
  const {userId, newPicture} = await readBody(event);

  let imageURL = null;

  try {
    imageURL = await cloudinary.uploader.upload(newPicture, {
      public_id: `${userId}`,
      overwrite: true,
      unique_filename: false,
    });
    
  } catch(error) {
    console.error("Error uploading picture to Cloudinary", error);
    const message = getMessage(error);
    setResponseStatus(event, 500, message);
  }

  if (imageURL) {

    let updatedUser;

    try {
      updatedUser = await mongo.updateUser(userId, { picture: imageURL.secure_url })
    } catch(error) {
      console.error("Error updating user's picture", error);
      const message = getMessage(error);
      setResponseStatus(event, 500, message);
    }

    setResponseStatus(event, 200);
    return updatedUser;

  } else {
    setResponseStatus(event, 500, "Could not update picture");
  }
})