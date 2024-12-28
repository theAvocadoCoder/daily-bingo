import { mongo } from "~/server";

export default defineEventHandler(async (event) => {
  try {
    await mongo.connect();
  } catch (error) {
    console.error("Failed to connect to MongoDB because %s", error);
  }
})