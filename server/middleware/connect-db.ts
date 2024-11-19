import { mongo } from "~/server";

export default defineEventHandler((event) => {
  mongo.connect();
})