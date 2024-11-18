import { cloudinary, getMessage, mongo } from "~/server";

export default defineEventHandler(async (event) => {
  await mongo.connect();
  const { creator, name, picture } = await readBody(event);

  try {
    const group = {
      cards: [],
      created_at: new Date().toISOString(),
      creator,
      history: [],
      isDeleted: false,
      members: [
        {
          ...creator,
          role: "super-admin",
        }
      ],
      name,
      picture: "",
      references: 1,
    };

    let newGroup = await mongo.insertGroup(group);
      
    if (newGroup && picture !== "") {
      await cloudinary.uploader.upload(picture, {
        public_id: `groups/${newGroup._id}`,
        overwrite: true,
        unique_filename: false,
      })
      .catch((error) => {
        let message = getMessage(error.message);
        console.info("Could not save group picture because %s", message);
        setResponseStatus(event, error.http_code, message);
      })
      .then(async (results) => {
        if (results) {
          newGroup = await $fetch(`/api/groups/${newGroup._id}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              group: {
                picture: results.secure_url,
              }
            })
          });
        }
      });
    }

    setResponseStatus(event, 200)
    return newGroup;
    
  } catch (error) {
    let message = getMessage(error);
    console.info("Create group %s failed because %s", name, message);
    setResponseStatus(event, 500, message);
  }
})
