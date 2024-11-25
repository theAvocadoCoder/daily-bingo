import { mongo } from "~/server";

export default defineEventHandler((event) => {
  console.info("The connect middleware ran")
  mongo.connect();
})