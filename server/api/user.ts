import MongoIO from "../config/MongoIO"

export default defineEventHandler(async (event) => {
  const mongo = new MongoIO();
  mongo.connect();
  return {
    username: "theAvocadoCoder"
  }
})